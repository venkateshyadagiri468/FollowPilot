import OpenAI from "openai";

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || "sk-dummy-key-for-followpilot-dev";
  return new OpenAI({
    apiKey,
  });
}

export interface OpenAIAnalysisResult {
  intent: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  signals: string[];
  recommendedAction: "FOLLOW_UP_NOW" | "FOLLOW_UP_LATER" | "WAIT_FOR_RESPONSE" | "NURTURE" | "NO_ACTION" | "SCHEDULE_MEETING";
  reasoning: string;
  calculatedScore: number;
}

export interface OpenAIFollowupDraft {
  subject: string;
  body: string;
  reason: string;
  recommendedTiming: string;
}
