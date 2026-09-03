import { LeadEntity } from "@/modules/leads/repository";
import { AIAnalysisOutput, RecommendedAction } from "./schemas";

export const MIN_RECOMMENDED_DELAY_HOURS = 2;
export const MAX_RECOMMENDED_DELAY_HOURS = 720; // 30 days

export interface FinalValidatedIntelligence extends AIAnalysisOutput {
  originalAiRecommendation: RecommendedAction;
  safetyOverrideApplied: boolean;
}

export class SafetyRulesEngine {
  /**
   * Evaluates AI output against deterministic application state invariants.
   * Separates AI interpretation (intent, sentiment, evidence) from Recommendation Engine.
   */
  applyBusinessSafetyRules(
    lead: LeadEntity,
    aiOutput: AIAnalysisOutput
  ): FinalValidatedIntelligence {
    const originalAiRecommendation = aiOutput.recommendedAction;
    let finalAction = originalAiRecommendation;
    let rawDelayHours = aiOutput.recommendedDelayHours;
    let safetyOverrideApplied = false;
    let overrideReasoning = aiOutput.reasoningSummary;

    // 1. Clamp recommended delay hours to safe application bounds (2h to 720h)
    let finalDelayHours = Math.max(
      MIN_RECOMMENDED_DELAY_HOURS,
      Math.min(MAX_RECOMMENDED_DELAY_HOURS, rawDelayHours)
    );

    // Rule 1: Closed-Won Leads require no follow-up outreach
    if (lead.status === "WON") {
      finalAction = "NO_ACTION";
      finalDelayHours = 0;
      safetyOverrideApplied = true;
      overrideReasoning = `[Safety Rule Applied] Lead status is WON. Active sales outreach is complete. ${aiOutput.reasoningSummary}`;
    }

    // Rule 2: Closed-Lost Leads pause active sales follow-up
    else if (lead.status === "LOST") {
      finalAction = "NO_ACTION";
      finalDelayHours = 0;
      safetyOverrideApplied = true;
      overrideReasoning = `[Safety Rule Applied] Lead status is LOST. Sales outreach paused. ${aiOutput.reasoningSummary}`;
    }

    // Rule 3: Dormant Leads are routed to long-term nurturing
    else if (lead.status === "DORMANT") {
      if (finalAction === "FOLLOW_UP_NOW" || finalAction === "SCHEDULE_MEETING") {
        finalAction = "NURTURE";
        finalDelayHours = 168; // 7 days
        safetyOverrideApplied = true;
        overrideReasoning = `[Safety Rule Applied] Lead is DORMANT. Re-engaging via nurture sequence instead of direct call. ${aiOutput.reasoningSummary}`;
      }
    }

    // Rule 4: Insufficient / UNKNOWN intent defaults to WAIT_FOR_RESPONSE or NURTURE
    else if (aiOutput.intent === "UNKNOWN" && (finalAction === "FOLLOW_UP_NOW" || finalAction === "SCHEDULE_MEETING")) {
      finalAction = "WAIT_FOR_RESPONSE";
      finalDelayHours = 48;
      safetyOverrideApplied = true;
      overrideReasoning = `[Safety Rule Applied] Intent classified as UNKNOWN due to insufficient evidence. Pausing aggressive outreach. ${aiOutput.reasoningSummary}`;
    }

    return {
      ...aiOutput,
      recommendedAction: finalAction,
      recommendedDelayHours: finalDelayHours,
      reasoningSummary: overrideReasoning,
      originalAiRecommendation,
      safetyOverrideApplied,
    };
  }
}

export const safetyRulesEngine = new SafetyRulesEngine();
