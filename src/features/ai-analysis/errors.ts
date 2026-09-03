import { AppError } from "@/lib/errors";

export class AIProviderUnavailableError extends AppError {
  constructor(message = "AI Provider is temporarily unavailable") {
    super(message, 503, "AI_PROVIDER_UNAVAILABLE");
  }
}

export class AIRequestTimeoutError extends AppError {
  constructor(message = "AI request execution timed out") {
    super(message, 504, "AI_REQUEST_TIMEOUT");
  }
}

export class AIInvalidResponseError extends AppError {
  constructor(message = "AI returned malformed or invalid response") {
    super(message, 422, "AI_INVALID_RESPONSE");
  }
}

export class AIQuotaExceededError extends AppError {
  constructor(message = "AI monthly quota limit exceeded for organization tier") {
    super(message, 429, "AI_QUOTA_EXCEEDED");
  }
}

export class AIPromptInjectionError extends AppError {
  constructor(message = "Prompt injection attempt detected in lead input") {
    super(message, 400, "AI_PROMPT_INJECTION_DETECTED");
  }
}
