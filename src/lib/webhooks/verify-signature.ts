import crypto from "crypto";
import { AuthenticationError, ValidationError } from "../errors";

interface WebhookVerificationOptions {
  rawBody: string;
  signatureHeader: string;
  secret: string;
  provider: "stripe" | "resend";
}

const processedWebhookCache = new Set<string>();

export function verifyWebhookSignature(options: WebhookVerificationOptions): boolean {
  const { rawBody, signatureHeader, secret, provider } = options;

  if (!signatureHeader || !secret) {
    throw new AuthenticationError(`Missing webhook signature header or secret for ${provider}`);
  }

  if (provider === "stripe") {
    // Basic HMC SHA256 signature verification contract
    const elements = signatureHeader.split(",");
    const timestamp = elements.find((e) => e.startsWith("t="))?.split("=")[1];
    const signature = elements.find((e) => e.startsWith("v1="))?.split("=")[1];

    if (!timestamp || !signature) {
      throw new ValidationError("Invalid Stripe webhook signature format");
    }

    const payload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  return true;
}

export function isWebhookIdempotent(eventId: string): boolean {
  if (processedWebhookCache.has(eventId)) {
    return false; // Already processed
  }
  processedWebhookCache.add(eventId);
  return true; // First time processing
}
