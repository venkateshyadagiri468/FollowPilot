export type {
  LeadIntent,
  Sentiment,
  RecommendedAction,
  Urgency,
  AnalysisStatus,
  EvidenceItem,
  AIAnalysisInput,
  AIAnalysisOutput,
  AIAnalysisEntity,
} from "./schemas";

export interface AnalysisTriggerOptions {
  organizationId: string;
  leadId: string;
  triggeredByUserId?: string;
  forceReanalysis?: boolean;
}

export interface ModelSelectionConfig {
  modelId: string;
  maxTokens: number;
  temperature: number;
}
