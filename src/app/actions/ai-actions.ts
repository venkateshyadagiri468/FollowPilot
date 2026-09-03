"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { aiAnalysisService } from "@/features/ai-analysis/service";
import { RecommendedActionEnum } from "@/features/ai-analysis/schemas";
import { checkRateLimit } from "@/lib/rate-limit";

const triggerAnalysisSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  forceReanalysis: z.boolean().optional(),
});

export const triggerLeadAnalysisAction = createSafeAction(
  triggerAnalysisSchema,
  async (input, context) => {
    // 1. Sliding window rate limit: max 10 manual analysis requests per user per minute
    await checkRateLimit({
      key: `ai_analysis:${context.userId}`,
      limit: 10,
      windowMs: 60000,
    });

    // 2. Execute AI Lead Analysis
    const analysis = await aiAnalysisService.analyzeLead({
      organizationId: context.orgId,
      leadId: input.leadId,
      triggeredByUserId: context.userId,
      forceReanalysis: input.forceReanalysis || false,
    });

    return analysis;
  },
  { requiredPermission: "view_leads" }
);

const overrideAnalysisSchema = z.object({
  analysisId: z.string().min(1, "Analysis ID is required"),
  overrideAction: RecommendedActionEnum,
  reason: z.string().optional(),
});

export const overrideAIAnalysisAction = createSafeAction(
  overrideAnalysisSchema,
  async (input, context) => {
    const updated = await aiAnalysisService.recordHumanOverride(
      context.orgId,
      input.analysisId,
      context.userId,
      input.overrideAction,
      input.reason
    );
    return updated;
  },
  { requiredPermission: "edit_leads" }
);

const getLeadAnalysisSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
});

export const getLeadAnalysisAction = createSafeAction(
  getLeadAnalysisSchema,
  async (input, context) => {
    const analysis = await aiAnalysisService.getLatestAnalysis(context.orgId, input.leadId);
    return analysis;
  },
  { requiredPermission: "view_leads" }
);
