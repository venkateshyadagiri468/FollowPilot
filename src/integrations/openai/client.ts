import OpenAI from "openai";
import { serverEnv } from "@/lib/env/server";
import { logger } from "@/lib/logging";
import { AIProviderUnavailableError, AIRequestTimeoutError } from "@/features/ai-analysis/errors";
import { OPENAI_STRICT_JSON_SCHEMA } from "@/features/ai-analysis/schemas";
import { OpenAIExecutionOptions, OpenAIExecutionResult } from "./types";

export class OpenAIClient {
  private openai: OpenAI | null = null;

  constructor() {
    if (serverEnv.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: serverEnv.OPENAI_API_KEY });
    }
  }

  /**
   * Executes LLM completion with OpenAI Strict Structured Outputs (json_schema),
   * 5,000ms hard timeout, and 1 exponential backoff retry for transient errors.
   */
  async executeStructuredCompletion(
    options: OpenAIExecutionOptions
  ): Promise<OpenAIExecutionResult> {
    const {
      systemPrompt,
      userPrompt,
      model = "gpt-4o-mini-2024-07-18",
      maxTokens = 600,
      temperature = 0.2,
      timeoutMs = 5000,
    } = options;

    if (!this.openai || !serverEnv.OPENAI_API_KEY) {
      throw new AIProviderUnavailableError("OPENAI_API_KEY environment variable is not configured");
    }

    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await this.openai.chat.completions.create(
          {
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            // Enforce OpenAI Strict Structured Outputs json_schema
            response_format: {
              type: "json_schema",
              json_schema: OPENAI_STRICT_JSON_SCHEMA,
            },
            max_tokens: maxTokens,
            temperature,
          },
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);
        const latencyMs = Date.now() - startTime;
        const content = response.choices[0]?.message?.content || "";

        return {
          rawJsonOutput: content,
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
          model: response.model || model,
          latencyMs,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === "AbortError" || err.message?.includes("aborted")) {
          logger.warn("OpenAI API call timed out", { timeoutMs, attempt });
          if (attempt >= maxAttempts) {
            throw new AIRequestTimeoutError(`OpenAI API request exceeded timeout of ${timeoutMs}ms`);
          }
        } else {
          logger.warn("OpenAI API call failed", { error: err.message, attempt });
          if (attempt >= maxAttempts) {
            throw new AIProviderUnavailableError(`OpenAI API error: ${err.message}`);
          }
        }

        // Wait 300ms backoff before single retry
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    throw new AIProviderUnavailableError("OpenAI API completion failed after max retries");
  }
}

export const openAIClient = new OpenAIClient();
