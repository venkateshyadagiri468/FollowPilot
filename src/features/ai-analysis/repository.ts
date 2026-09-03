import { AIAnalysisEntity, AnalysisStatus, RecommendedAction } from "./schemas";
import { ValidationError } from "@/lib/errors";

const LEGAL_TRANSITIONS: Record<AnalysisStatus, AnalysisStatus[]> = {
  PENDING: ["PROCESSING", "FAILED"],
  PROCESSING: ["COMPLETED", "FAILED"],
  COMPLETED: ["STALE"],
  FAILED: ["PENDING"],
  STALE: ["PENDING"],
};

export class AIAnalysisRepository {
  private static analysesStore: AIAnalysisEntity[] = [];

  private validateTransition(currentStatus: AnalysisStatus, nextStatus: AnalysisStatus): void {
    if (currentStatus === nextStatus) return;
    const allowed = LEGAL_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new ValidationError(
        `Invalid AI analysis lifecycle transition: cannot transition from '${currentStatus}' to '${nextStatus}'`
      );
    }
  }

  async findLatestByLeadId(
    orgId: string,
    leadId: string
  ): Promise<AIAnalysisEntity | null> {
    const records = AIAnalysisRepository.analysesStore.filter(
      (a) => a.organizationId === orgId && a.leadId === leadId
    );
    if (records.length === 0) return null;
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return records[0];
  }

  async findByFingerprint(
    orgId: string,
    leadId: string,
    fingerprint: string
  ): Promise<AIAnalysisEntity | null> {
    const record = AIAnalysisRepository.analysesStore.find(
      (a) =>
        a.organizationId === orgId &&
        a.leadId === leadId &&
        a.contextFingerprint === fingerprint &&
        a.status === "COMPLETED"
    );
    if (!record) return null;

    // Check 60-minute cache window
    const createdAt = new Date(record.createdAt).getTime();
    if (Date.now() - createdAt > 60 * 60 * 1000) {
      // Mark as STALE if window expired
      record.status = "STALE";
      return null;
    }
    return record;
  }

  async createPendingAnalysis(
    orgId: string,
    leadId: string,
    promptVersion: string,
    model: string,
    contextFingerprint?: string
  ): Promise<AIAnalysisEntity> {
    const entity: AIAnalysisEntity = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      leadId,
      status: "PENDING",
      analysisSource: "AI",
      intent: "UNKNOWN",
      intentConfidence: 0.0,
      sentiment: "UNKNOWN",
      sentimentConfidence: 0.0,
      urgency: "MEDIUM",
      signals: [],
      evidence: [],
      recommendedAction: "NO_ACTION",
      recommendedDelayHours: 24,
      reasoning: "Analysis initiated...",
      risks: [],
      calculatedScore: 50,
      scoreSnapshot: 50,
      contextFingerprint: contextFingerprint || null,
      promptVersion,
      model,
      modelVersion: null,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCost: "0.0000",
      isFallback: false,
      humanOverrideAction: null,
      overrideByUserId: null,
      overrideAt: null,
      overrideReason: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    AIAnalysisRepository.analysesStore.unshift(entity);
    return entity;
  }

  async updateStatus(analysisId: string, nextStatus: AnalysisStatus): Promise<AIAnalysisEntity> {
    const idx = AIAnalysisRepository.analysesStore.findIndex((a) => a.id === analysisId);
    if (idx === -1) {
      throw new Error(`Analysis record ${analysisId} not found`);
    }

    const current = AIAnalysisRepository.analysesStore[idx];
    this.validateTransition(current.status, nextStatus);

    const updated = { ...current, status: nextStatus };
    AIAnalysisRepository.analysesStore[idx] = updated;
    return updated;
  }

  async markPreviousAnalysesStale(orgId: string, leadId: string, exceptAnalysisId: string): Promise<void> {
    for (const item of AIAnalysisRepository.analysesStore) {
      if (item.organizationId === orgId && item.leadId === leadId && item.id !== exceptAnalysisId && item.status === "COMPLETED") {
        item.status = "STALE";
      }
    }
  }

  async saveCompletedAnalysis(
    analysisId: string,
    data: Partial<AIAnalysisEntity>
  ): Promise<AIAnalysisEntity> {
    const idx = AIAnalysisRepository.analysesStore.findIndex((a) => a.id === analysisId);
    if (idx === -1) {
      throw new Error(`Analysis record ${analysisId} not found`);
    }

    const current = AIAnalysisRepository.analysesStore[idx];
    const targetStatus = data.status || "COMPLETED";

    // Validate transition
    this.validateTransition(current.status, targetStatus);

    const updated: AIAnalysisEntity = {
      ...current,
      ...data,
      status: targetStatus,
      completedAt: new Date().toISOString(),
    };

    AIAnalysisRepository.analysesStore[idx] = updated;

    // Automatically mark older completed records for this lead as STALE
    if (targetStatus === "COMPLETED") {
      await this.markPreviousAnalysesStale(current.organizationId, current.leadId, analysisId);
    }

    return updated;
  }

  async recordHumanOverride(
    orgId: string,
    analysisId: string,
    userId: string,
    overrideAction: RecommendedAction,
    reason?: string
  ): Promise<AIAnalysisEntity> {
    const idx = AIAnalysisRepository.analysesStore.findIndex(
      (a) => a.id === analysisId && a.organizationId === orgId
    );
    if (idx === -1) {
      throw new Error(`Analysis record ${analysisId} not found in organization`);
    }

    const current = AIAnalysisRepository.analysesStore[idx];
    const updated: AIAnalysisEntity = {
      ...current,
      humanOverrideAction: overrideAction,
      overrideByUserId: userId,
      overrideAt: new Date().toISOString(),
      overrideReason: reason || null,
    };

    AIAnalysisRepository.analysesStore[idx] = updated;
    return updated;
  }

  async getHistoryForLead(
    orgId: string,
    leadId: string,
    limit = 10
  ): Promise<AIAnalysisEntity[]> {
    return AIAnalysisRepository.analysesStore
      .filter((a) => a.organizationId === orgId && a.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const aiAnalysisRepository = new AIAnalysisRepository();
