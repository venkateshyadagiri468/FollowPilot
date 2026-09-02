import { logger } from "@/lib/logging";

export function captureException(error: Error, context?: Record<string, any>) {
  logger.error("Sentry Exception Captured", {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  logger.info("Sentry Message Logged", { message, level });
}
