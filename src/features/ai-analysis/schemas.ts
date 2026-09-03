import { z } from "zod";

export const LeadIntentEnum = z.enum(["HIGH", "MEDIUM", "LOW", "UNKNOWN"]);
export type LeadIntent = z.infer<typeof LeadIntentEnum>;

export const SentimentEnum = z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED", "UNKNOWN"]);
export type Sentiment = z.infer<typeof SentimentEnum>;

export const RecommendedActionEnum = z.enum([
  "FOLLOW_UP_NOW",
  "FOLLOW_UP_LATER",
  "WAIT_FOR_RESPONSE",
  "NURTURE",
  "NO_ACTION",
  "SCHEDULE_MEETING",
]);
export type RecommendedAction = z.infer<typeof RecommendedActionEnum>;

export const UrgencyEnum = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type Urgency = z.infer<typeof UrgencyEnum>;

export const AnalysisStatusEnum = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED", "STALE"]);
export type AnalysisStatus = z.infer<typeof AnalysisStatusEnum>;

export const AnalysisSourceEnum = z.enum(["AI", "DETERMINISTIC_FALLBACK"]);
export type AnalysisSource = z.infer<typeof AnalysisSourceEnum>;

// Evidence item structure with source provenance
export const EvidenceSourceTypeEnum = z.enum(["ACTIVITY", "MESSAGE", "LEAD_FIELD", "HEURISTIC"]);
export type EvidenceSourceType = z.infer<typeof EvidenceSourceTypeEnum>;

export const EvidenceItemSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  sourceType: EvidenceSourceTypeEnum.optional(),
  sourceId: z.string().optional(),
  timestamp: z.string().optional(),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

// Contract for Context Builder normalized input payload
export const AIAnalysisInputSchema = z.object({
  lead: z.object({
    id: z.string(),
    organizationId: z.string(),
    name: z.string(),
    email: z.string(),
    company: z.string().nullable(),
    jobTitle: z.string().nullable(),
    status: z.string(),
    currentScore: z.number(),
    priority: z.string(),
    daysInactive: z.number(),
  }),
  recentActivities: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      occurredAt: z.string(),
      summary: z.string(),
    })
  ).max(10),
  conversations: z.array(
    z.object({
      id: z.string(),
      direction: z.enum(["INBOUND", "OUTBOUND"]),
      sentAt: z.string(),
      sanitizedTextSnippet: z.string(),
    })
  ).max(5),
  deterministicSignals: z.object({
    heuristicScore: z.number(),
    hasRecentInboundReply: z.boolean(),
    pricingRequested: z.boolean(),
    proposalSent: z.boolean(),
    daysSinceLastActivity: z.number(),
  }),
  currentDate: z.string(),
  promptVersion: z.string(),
});
export type AIAnalysisInput = z.infer<typeof AIAnalysisInputSchema>;

// Contract for LLM Strict Structured Output (OpenAI json_schema compliant)
export const AIAnalysisOutputSchema = z.object({
  intent: LeadIntentEnum,
  intentConfidence: z.number().min(0.0).max(1.0),
  sentiment: SentimentEnum,
  sentimentConfidence: z.number().min(0.0).max(1.0),
  urgency: UrgencyEnum,
  reasoningSummary: z.string().min(10).max(800),
  evidence: z.array(EvidenceItemSchema).max(8),
  recommendedAction: RecommendedActionEnum,
  recommendedDelayHours: z.number().int().min(2).max(720),
  risks: z.array(z.string().max(200)).max(5),
  calculatedScore: z.number().int().min(0).max(100),
});
export type AIAnalysisOutput = z.infer<typeof AIAnalysisOutputSchema>;

// JSON Schema object structure for OpenAI Strict Structured Outputs API
export const OPENAI_STRICT_JSON_SCHEMA = {
  name: "ai_lead_analysis_response",
  strict: true,
  schema: {
    type: "object",
    properties: {
      intent: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "UNKNOWN"] },
      intentConfidence: { type: "number" },
      sentiment: { type: "string", enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED", "UNKNOWN"] },
      sentimentConfidence: { type: "number" },
      urgency: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
      reasoningSummary: { type: "string" },
      evidence: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string" },
            description: { type: "string" },
            sourceType: { type: "string", enum: ["ACTIVITY", "MESSAGE", "LEAD_FIELD", "HEURISTIC"] },
            sourceId: { type: "string" },
            timestamp: { type: "string" },
          },
          required: ["type", "description"],
          additionalProperties: false,
        },
      },
      recommendedAction: {
        type: "string",
        enum: [
          "FOLLOW_UP_NOW",
          "FOLLOW_UP_LATER",
          "WAIT_FOR_RESPONSE",
          "NURTURE",
          "NO_ACTION",
          "SCHEDULE_MEETING",
        ],
      },
      recommendedDelayHours: { type: "integer" },
      risks: { type: "array", items: { type: "string" } },
      calculatedScore: { type: "integer" },
    },
    required: [
      "intent",
      "intentConfidence",
      "sentiment",
      "sentimentConfidence",
      "urgency",
      "reasoningSummary",
      "evidence",
      "recommendedAction",
      "recommendedDelayHours",
      "risks",
      "calculatedScore",
    ],
    additionalProperties: false,
  },
};

// Full Domain Entity Schema including Human Override & Source Audit
export const AIAnalysisEntitySchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  leadId: z.string(),
  status: AnalysisStatusEnum,
  analysisSource: AnalysisSourceEnum,
  intent: LeadIntentEnum,
  intentConfidence: z.number().min(0.0).max(1.0),
  sentiment: SentimentEnum,
  sentimentConfidence: z.number().min(0.0).max(1.0),
  urgency: UrgencyEnum,
  signals: z.array(z.string()),
  evidence: z.array(EvidenceItemSchema),
  recommendedAction: RecommendedActionEnum,
  recommendedDelayHours: z.number().int().nullable(),
  reasoning: z.string(),
  risks: z.array(z.string()),
  calculatedScore: z.number().int().min(0).max(100),
  scoreSnapshot: z.number().int(),
  contextFingerprint: z.string().nullable(),
  promptVersion: z.string(),
  model: z.string(),
  modelVersion: z.string().nullable(),
  inputTokens: z.number().int(),
  outputTokens: z.number().int(),
  totalTokens: z.number().int(),
  estimatedCost: z.string(),
  isFallback: z.boolean(),
  humanOverrideAction: RecommendedActionEnum.nullable().optional(),
  overrideByUserId: z.string().nullable().optional(),
  overrideAt: z.string().nullable().optional(),
  overrideReason: z.string().nullable().optional(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
});
export type AIAnalysisEntity = z.infer<typeof AIAnalysisEntitySchema>;
