export interface OpenAIExecutionOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface OpenAIExecutionResult {
  rawJsonOutput: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
  latencyMs: number;
}
