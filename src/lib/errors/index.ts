export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    isOperational = true,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input parameters", details?: Record<string, any>) {
    super(message, 400, "VALIDATION_ERROR", true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHENTICATED", true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Permission denied for this resource") {
    super(message, 403, "FORBIDDEN", true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND", true);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource state conflict") {
    super(message, 409, "CONFLICT", true);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded. Please try again later.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED", true);
  }
}

export class QuotaExceededError extends RateLimitError {}

export class ExternalServiceError extends AppError {
  constructor(service: string, message = "External service request failed") {
    super(`${service}: ${message}`, 502, "EXTERNAL_SERVICE_ERROR", false);
  }
}

export function formatAppError(error: unknown): { statusCode: number; code: string; message: string } {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
    };
  }

  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: process.env.NODE_ENV === "production" ? "Internal server error" : message,
  };
}

export function formatErrorResponse(error: unknown) {
  const formatted = formatAppError(error);
  return {
    status: formatted.statusCode,
    body: {
      error: {
        code: formatted.code,
        message: formatted.message,
      },
    },
  };
}
