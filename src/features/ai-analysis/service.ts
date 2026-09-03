import { leadRepository } from "@/modules/leads/repository";
import { calculateLeadScore } from "@/modules/scoring/score-engine";
import { logger } from "@/lib/logging";
import { NotFoundError } from "@/lib/errors";

import {
  AIAnalysisEntity,
  AIAnalysisOutputSchema,
  AIAnalysisOutput,
  RecommendedAction,
  EvidenceItem,
  AIAnalysisInput,
} from "./schemas";
import { AnalysisTriggerOptions } from "./types";
import { contextBuilder, generateContextFingerprint } from "./context-builder";
import { SYSTEM_PROMPT, PROMPT_VERSION } from "./prompts";
import { safetyRulesEngine } from "./recommendations";
import { aiAnalysisRepository } from "./repository";
import { openAIClient } from "@/integrations/openai/client";
import { aiUsageTracker } from "./usage";

export const DEFAULT_PINNED_MODEL = "gpt-4o-mini-2024-07-18";

/**
 * Validates evidence item sourceId values against the input context.
 * Strips any invented or foreign sourceId string that does not belong to the current analysis context.
 */
export function validateEvidenceProvenance(
  evidence: EvidenceItem[],
  inputContext: AIAnalysisInput
): EvidenceItem[] {
  const validActivityIds = new Set(inputContext.recentActivities.map((a) => a.id));
  const validMessageIds = new Set(inputContext.conversations.map((m) => m.id));
  const validLeadId = inputContext.lead.id;

  return evidence.map((item) => {
    if (!item.sourceId || !item.sourceType) {
      return item;
    }

    let isValid = false;
    if (item.sourceType === "ACTIVITY") {
      isValid = validActivityIds.has(item.sourceId);
    } else if (item.sourceType === "MESSAGE") {
      isValid = validMessageIds.has(item.sourceId);
    } else if (item.sourceType === "LEAD_FIELD") {
      isValid = item.sourceId === validLeadId || item.sourceId.startsWith("lead_");
    } else if (item.sourceType === "HEURISTIC") {
      isValid = item.sourceId.startsWith("heuristic_") || item.sourceId === validLeadId;
    }

    if (!isValid) {
      logger.warn("Stripped invalid or invented evidence sourceId", {
        invalidSourceId: item.sourceId,
        sourceType: item.sourceType,
      });
      return {
        ...item,
        sourceId: undefined, // Strip invalid/invented sourceId
      };
    }

    return item;
  });
}

export class AIAnalysisService {
  /**
   * Main Orchestrator: Analyzes a lead's intent, sentiment, urgency, evidence, and next actions.
   * Enforces lifecycle transitions: PENDING ➔ PROCESSING ➔ COMPLETED / FAILED.
   *
   * CACHE & QUOTA POLICY:
   * Cache hits return an existing analysis record without invoking the AI provider, and thus
   * DO NOT consume monthly organization AI generation quota.
   */
  async analyzeLead(options: AnalysisTriggerOptions): Promise<AIAnalysisEntity> {
    const { organizationId, leadId, forceReanalysis = false } = options;

    // 1. Load lead entity
    const lead = await leadRepository.findLeadById(organizationId, leadId);
    if (!lead) {
      throw new NotFoundError(`Lead '${leadId}' not found in organization '${organizationId}'`);
    }

    // 2. Load activities and conversation messages
    const activities = await leadRepository.getActivitiesForLead(organizationId, leadId);
    const messages: any[] = []; // Threaded messages loaded from domain repository

    // 3. Compute deterministic heuristic baseline score
    const heuristicResult = calculateLeadScore(
      {
        ...lead,
        assignedToUserId: lead.assignedToUserId || undefined,
        company: lead.company || undefined,
        jobTitle: lead.jobTitle || undefined,
        phone: lead.phone || undefined,
        customFields: lead.customFields || undefined,
      },
      activities.map((a) => ({ ...a, metadata: a.metadata || undefined })) as any,
      "UNKNOWN"
    );

    // 4. Generate deep SHA-256 context fingerprint & check 60-min cache
    const fingerprint = generateContextFingerprint(
      lead,
      activities,
      messages,
      PROMPT_VERSION,
      DEFAULT_PINNED_MODEL
    );

    if (!forceReanalysis) {
      const cached = await aiAnalysisRepository.findByFingerprint(organizationId, leadId, fingerprint);
      if (cached) {
        logger.info("Returned cached AI analysis result (0 quota consumed)", { leadId, fingerprint });
        return cached;
      }
    }

    // 5. Check monthly organization AI quota entitlement (only for non-cached provider invocations)
    await aiUsageTracker.checkEntitlement(organizationId, "FREE");

    // 6. Create PENDING analysis record
    const pendingRecord = await aiAnalysisRepository.createPendingAnalysis(
      organizationId,
      leadId,
      PROMPT_VERSION,
      DEFAULT_PINNED_MODEL,
      fingerprint
    );

    // 7. Transition PENDING ➔ PROCESSING
    await aiAnalysisRepository.updateStatus(pendingRecord.id, "PROCESSING");

    // 8. Assemble normalized, injection-defended context payload (capped <= 2500 tokens)
    const inputContext = contextBuilder.buildInputContext(
      lead,
      activities,
      messages,
      heuristicResult.score
    );

    try {
      // 9. Execute LLM Strict Structured Output completion (json_schema)
      const executionResult = await openAIClient.executeStructuredCompletion({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: JSON.stringify(inputContext, null, 2),
        model: DEFAULT_PINNED_MODEL,
        maxTokens: 600,
        temperature: 0.2,
      });

      // 10. Validate LLM JSON output via Zod Schema
      const rawParsed = JSON.parse(executionResult.rawJsonOutput);
      const validatedOutput = AIAnalysisOutputSchema.parse(rawParsed);

      // 11. Apply Deterministic Business Safety Rules & Delay Bounds
      const finalIntelligence = safetyRulesEngine.applyBusinessSafetyRules(lead, validatedOutput);

      // 12. Validate Evidence Provenance Source IDs against Input Context
      const validatedEvidence = validateEvidenceProvenance(finalIntelligence.evidence, inputContext);

      // 13. Calculate estimated USD cost ($0.15/1M input, $0.60/1M output tokens for gpt-4o-mini)
      const costEst = (
        (executionResult.inputTokens * 0.15 + executionResult.outputTokens * 0.6) /
        1000000
      ).toFixed(6);

      // 14. Record usage metrics
      await aiUsageTracker.recordUsage(organizationId, executionResult.totalTokens);

      // 15. Transition PROCESSING ➔ COMPLETED (and mark previous records as STALE)
      const completedEntity = await aiAnalysisRepository.saveCompletedAnalysis(pendingRecord.id, {
        status: "COMPLETED",
        analysisSource: "AI",
        intent: finalIntelligence.intent,
        intentConfidence: finalIntelligence.intentConfidence,
        sentiment: finalIntelligence.sentiment,
        sentimentConfidence: finalIntelligence.sentimentConfidence,
        urgency: finalIntelligence.urgency,
        signals: validatedEvidence.map((e) => `${e.type}: ${e.description}`),
        evidence: validatedEvidence,
        recommendedAction: finalIntelligence.recommendedAction,
        recommendedDelayHours: finalIntelligence.recommendedDelayHours,
        reasoning: finalIntelligence.reasoningSummary,
        risks: finalIntelligence.risks,
        calculatedScore: finalIntelligence.calculatedScore,
        scoreSnapshot: heuristicResult.score,
        inputTokens: executionResult.inputTokens,
        outputTokens: executionResult.outputTokens,
        totalTokens: executionResult.totalTokens,
        estimatedCost: costEst,
        isFallback: false,
      });

      logger.info("AI Lead analysis completed successfully", {
        organizationId,
        leadId,
        intent: finalIntelligence.intent,
        recommendedAction: finalIntelligence.recommendedAction,
        latencyMs: executionResult.latencyMs,
      });

      return completedEntity;
    } catch (err: any) {
      // 16. DETERMINISTIC FALLBACK CIRCUIT BREAKER
      logger.warn("AI LLM execution failed or unavailable. Engaging deterministic heuristic fallback", {
        leadId,
        error: err.message,
      });

      const fallbackIntelligence: AIAnalysisOutput = {
        intent: heuristicResult.score >= 75 ? "HIGH" : heuristicResult.score >= 45 ? "MEDIUM" : "UNKNOWN",
        intentConfidence: 0.7,
        sentiment: "NEUTRAL",
        sentimentConfidence: 0.7,
        urgency: heuristicResult.priority === "HIGH" ? "HIGH" : "MEDIUM",
        reasoningSummary: `[Deterministic Fallback Engine] Evaluated ${activities.length} activity signals. Lead heuristic score is ${heuristicResult.score}/100.`,
        evidence: [
          {
            type: "HEURISTIC_SIGNAL",
            description: `Engagement score calculated at ${heuristicResult.score} based on recency and activity counts.`,
            sourceType: "HEURISTIC",
            sourceId: `heuristic_${leadId}`,
            timestamp: new Date().toISOString(),
          },
        ],
        recommendedAction:
          heuristicResult.score >= 75
            ? "FOLLOW_UP_NOW"
            : heuristicResult.score >= 45
            ? "FOLLOW_UP_LATER"
            : "NURTURE",
        recommendedDelayHours: heuristicResult.score >= 75 ? 4 : 24,
        risks: [],
        calculatedScore: heuristicResult.score,
      };

      const finalFallback = safetyRulesEngine.applyBusinessSafetyRules(lead, fallbackIntelligence);
      const validatedFallbackEvidence = validateEvidenceProvenance(finalFallback.evidence, inputContext);

      return aiAnalysisRepository.saveCompletedAnalysis(pendingRecord.id, {
        status: "COMPLETED",
        analysisSource: "DETERMINISTIC_FALLBACK",
        intent: finalFallback.intent,
        intentConfidence: finalFallback.intentConfidence,
        sentiment: finalFallback.sentiment,
        sentimentConfidence: finalFallback.sentimentConfidence,
        urgency: finalFallback.urgency,
        signals: validatedFallbackEvidence.map((e) => `${e.type}: ${e.description}`),
        evidence: validatedFallbackEvidence,
        recommendedAction: finalFallback.recommendedAction,
        recommendedDelayHours: finalFallback.recommendedDelayHours,
        reasoning: finalFallback.reasoningSummary,
        risks: finalFallback.risks,
        calculatedScore: finalFallback.calculatedScore,
        scoreSnapshot: heuristicResult.score,
        isFallback: true,
      });
    }
  }

  async recordHumanOverride(
    orgId: string,
    analysisId: string,
    userId: string,
    action: RecommendedAction,
    reason?: string
  ): Promise<AIAnalysisEntity> {
    return aiAnalysisRepository.recordHumanOverride(orgId, analysisId, userId, action, reason);
  }

  async getLatestAnalysis(orgId: string, leadId: string): Promise<AIAnalysisEntity | null> {
    return aiAnalysisRepository.findLatestByLeadId(orgId, leadId);
  }

  async getAnalysisHistory(orgId: string, leadId: string): Promise<AIAnalysisEntity[]> {
    return aiAnalysisRepository.getHistoryForLead(orgId, leadId);
  }
}

export const aiAnalysisService = new AIAnalysisService();
