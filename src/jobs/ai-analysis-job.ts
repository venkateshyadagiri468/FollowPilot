import { aiAnalysisService } from "@/features/ai-analysis/service";
import { logger } from "@/lib/logging";

export interface AIJobTaskPayload {
  organizationId: string;
  leadId: string;
  triggeredByUserId?: string;
  forceReanalysis?: boolean;
}

export async function processAIAnalysisJob(payload: AIJobTaskPayload) {
  const { organizationId, leadId, forceReanalysis = false } = payload;
  logger.info("Starting async AI analysis job task", { organizationId, leadId });

  try {
    const result = await aiAnalysisService.analyzeLead({
      organizationId,
      leadId,
      forceReanalysis,
    });

    logger.info("Async AI analysis job completed", {
      analysisId: result.id,
      leadId,
      isFallback: result.isFallback,
    });

    return { success: true, analysisId: result.id };
  } catch (err: any) {
    logger.error("Async AI analysis job failed", {
      organizationId,
      leadId,
      error: err.message,
    });
    return { success: false, error: err.message };
  }
}
