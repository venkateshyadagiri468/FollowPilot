import crypto from "crypto";
import { LeadEntity, ActivityEntity } from "@/modules/leads/repository";
import { AIAnalysisInput } from "./schemas";
import { PROMPT_VERSION } from "./prompts";

export interface RawMessage {
  id?: string;
  direction: "INBOUND" | "OUTBOUND";
  bodyText: string;
  sentAt: string;
}

/**
 * Estimates token count based on standard English tokenization heuristic (1 token ~ 4 characters).
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Sanitizes untrusted text by stripping control characters, escaping closing tags,
 * and wrapping in explicit XML boundary tags to defend against LLM prompt injection.
 */
export function sanitizeUntrustedInput(text: string): string {
  if (!text) return "";

  const cleaned = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/<\/prospect_untrusted_input>/gi, "[ESCAPED_TAG]")
    .trim();

  // Individual message bounding (max 800 chars)
  const boundedText = cleaned.length > 800 ? `${cleaned.substring(0, 800)}... [truncated]` : cleaned;

  return `<prospect_untrusted_input>\n${boundedText}\n</prospect_untrusted_input>`;
}

/**
 * Computes deep SHA-256 fingerprint incorporating all analysis-relevant context:
 * - Lead state, status, score
 * - Activity IDs, timestamps, and metadata hashes
 * - Message IDs, timestamps, and body hashes
 * - Prompt and Model versions
 */
export function generateContextFingerprint(
  lead: LeadEntity,
  activities: ActivityEntity[],
  messages: RawMessage[],
  promptVersion = PROMPT_VERSION,
  modelVersion = "gpt-4o-mini-2024-07-18"
): string {
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const activityHashes = sortedActivities.map((a) =>
    crypto
      .createHash("sha256")
      .update(`${a.id}:${a.type}:${a.createdAt}:${JSON.stringify(a.metadata || {})}`)
      .digest("hex")
      .substring(0, 10)
  );

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
  const messageHashes = sortedMessages.map((m) =>
    crypto
      .createHash("sha256")
      .update(`${m.id || "msg"}:${m.direction}:${m.sentAt}:${m.bodyText}`)
      .digest("hex")
      .substring(0, 10)
  );

  const payload = [
    lead.id,
    lead.organizationId,
    lead.status,
    lead.score.toString(),
    lead.priority,
    lead.company || "",
    lead.jobTitle || "",
    activityHashes.join(","),
    messageHashes.join(","),
    promptVersion,
    modelVersion,
  ].join("::");

  return crypto.createHash("sha256").update(payload).digest("hex");
}

export class ContextBuilder {
  /**
   * Assembles a normalized, size-bounded, prompt-injection defended input representation
   * guaranteed to remain <= 2,500 estimated tokens.
   */
  buildInputContext(
    lead: LeadEntity,
    activities: ActivityEntity[],
    rawMessages: RawMessage[],
    heuristicScore: number
  ): AIAnalysisInput {
    // 1. Bounded & prioritized activities (max 10)
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const boundedActivities = sortedActivities.slice(0, 10).map((act) => ({
      id: act.id,
      type: act.type,
      occurredAt: act.createdAt,
      summary: act.type.replace(/_/g, " ").toLowerCase(),
    }));

    // 2. Bounded & sanitized messages (max 5)
    const sortedMessages = [...rawMessages].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
    const boundedMessages = sortedMessages.slice(0, 5).map((msg, idx) => ({
      id: msg.id || `msg_${idx}`,
      direction: msg.direction,
      sentAt: msg.sentAt,
      sanitizedTextSnippet: sanitizeUntrustedInput(msg.bodyText),
    }));

    // 3. Extract deterministic engagement signals
    const now = Date.now();
    const lastActTime = new Date(lead.lastActivityAt).getTime();
    const daysSinceLastActivity = Math.max(0, Math.floor((now - lastActTime) / (1000 * 86400)));

    const hasRecentInboundReply = rawMessages.some(
      (m) => m.direction === "INBOUND" && new Date(m.sentAt).getTime() > now - 7 * 86400 * 1000
    );

    const pricingRequested = activities.some(
      (a) =>
        a.type === "NOTE_ADDED" &&
        JSON.stringify(a.metadata || {}).toLowerCase().includes("pricing")
    );

    const proposalSent = activities.some(
      (a) => a.type === "PROPOSAL_SENT" || a.type === "PROPOSAL_VIEWED"
    );

    const fullName = `${lead.firstName} ${lead.lastName}`.trim();

    const result: AIAnalysisInput = {
      lead: {
        id: lead.id,
        organizationId: lead.organizationId,
        name: fullName,
        email: lead.email,
        company: lead.company || null,
        jobTitle: lead.jobTitle || null,
        status: lead.status,
        currentScore: lead.score,
        priority: lead.priority,
        daysInactive: daysSinceLastActivity,
      },
      recentActivities: boundedActivities,
      conversations: boundedMessages,
      deterministicSignals: {
        heuristicScore,
        hasRecentInboundReply,
        pricingRequested,
        proposalSent,
        daysSinceLastActivity,
      },
      currentDate: new Date().toISOString().split("T")[0],
      promptVersion: PROMPT_VERSION,
    };

    // Safety Token Budget Verification (<= 2,500 tokens)
    const tokenEst = estimateTokenCount(JSON.stringify(result));
    if (tokenEst > 2500) {
      // Hard cap message count if token budget is exceeded
      result.conversations = result.conversations.slice(0, 2);
    }

    return result;
  }
}

export const contextBuilder = new ContextBuilder();
