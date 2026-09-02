export interface LogContext {
  requestId?: string;
  organizationId?: string;
  userId?: string;
  operation?: string;
  [key: string]: any;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "apikey",
  "api_key",
  "token",
  "authorization",
  "creditcard",
  "cvv",
]);

function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

class Logger {
  private formatLog(level: "info" | "warn" | "error" | "debug", message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? redactSensitiveData(context) : {};

    return JSON.stringify({
      timestamp,
      level,
      message,
      ...sanitizedContext,
    });
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatLog("info", message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatLog("warn", message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatLog("error", message, context));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatLog("debug", message, context));
    }
  }
}

export const logger = new Logger();
