import OpenAI from "openai";
import { MockLead, MockActivity, MockConversation, MockAiAnalysis } from "../store/mock-store";
import { calculateLeadScore } from "../scoring/score-engine";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export interface GeneratedFollowupDraft {
  subject: string;
  body: string;
  reason: string;
  recommendedTiming: string;
}

export async function analyzeLeadContext(
  lead: MockLead,
  activities: MockActivity[] = [],
  conversation?: MockConversation
): Promise<MockAiAnalysis> {
  const contextSummary = {
    leadName: `${lead.firstName} ${lead.lastName}`,
    company: lead.company,
    jobTitle: lead.jobTitle,
    status: lead.status,
    activities: activities.map((a) => ({
      type: a.type,
      time: a.createdAt,
      metadata: a.metadata,
    })),
    messages: conversation?.messages.map((m) => ({
      direction: m.direction,
      body: m.bodyText,
      sentAt: m.sentAt,
    })),
  };

  if (openai && apiKey) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert sales analyst AI for FollowPilot SaaS.
Analyze the lead context and return a JSON object with EXACT keys:
- "intent": ("HIGH" | "MEDIUM" | "LOW" | "UNKNOWN")
- "signals": array of strings (bullet points explaining why)
- "recommendedAction": ("FOLLOW_UP_NOW" | "FOLLOW_UP_LATER" | "WAIT_FOR_RESPONSE" | "NURTURE" | "NO_ACTION" | "SCHEDULE_MEETING")
- "reasoning": string explanation`,
          },
          {
            role: "user",
            content: JSON.stringify(contextSummary),
          },
        ],
      });

      const parsed = JSON.parse(response.choices[0].message.content || "{}");
      const intent = parsed.intent || "MEDIUM";
      const scoreBreakdown = calculateLeadScore(lead, activities, intent);

      return {
        id: `ai_analysis_${Date.now()}`,
        leadId: lead.id,
        intent,
        signals: parsed.signals || ["Lead active in sales pipeline"],
        recommendedAction: parsed.recommendedAction || "FOLLOW_UP_NOW",
        reasoning: parsed.reasoning || "Context points to active engagement.",
        calculatedScore: scoreBreakdown.score,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("OpenAI API call failed, falling back to rule engine", err);
    }
  }

  // Smart Context Fallback
  let intent: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN" = "MEDIUM";
  const signals: string[] = [];

  const activityTypes = activities.map((a) => a.type);
  if (activityTypes.includes("EMAIL_REPLIED") || activityTypes.includes("PROPOSAL_VIEWED")) {
    intent = "HIGH";
    signals.push("Prospect replied or interacted with proposal");
    signals.push("Strong buying signal detected in timeline");
  } else if (activityTypes.includes("EMAIL_OPENED") || activityTypes.includes("EMAIL_CLICKED")) {
    intent = "MEDIUM";
    signals.push("Prospect opened outreach email");
    signals.push("Moderate engagement signal recorded");
  } else {
    intent = "LOW";
    signals.push("No response recorded yet");
    signals.push("Standard cold outreach stage");
  }

  const scoreBreakdown = calculateLeadScore(lead, activities, intent);

  return {
    id: `ai_analysis_${Date.now()}`,
    leadId: lead.id,
    intent,
    signals,
    recommendedAction: intent === "HIGH" ? "FOLLOW_UP_NOW" : intent === "MEDIUM" ? "FOLLOW_UP_LATER" : "NURTURE",
    reasoning: `Based on activity signals and lead profile, prospect shows ${intent.toLowerCase()} intent. ${
      intent === "HIGH" ? "Follow up immediately with pricing or scheduling details." : "Schedule a follow-up check-in."
    }`,
    calculatedScore: scoreBreakdown.score,
    createdAt: new Date().toISOString(),
  };
}

export async function generateFollowupDraft(
  lead: MockLead,
  analysis: MockAiAnalysis,
  conversation?: MockConversation,
  userNotes?: string
): Promise<GeneratedFollowupDraft> {
  const context = {
    prospectName: `${lead.firstName} ${lead.lastName}`,
    company: lead.company,
    jobTitle: lead.jobTitle,
    analysisReasoning: analysis.reasoning,
    recommendedAction: analysis.recommendedAction,
    lastMessage: conversation?.messages[conversation.messages.length - 1]?.bodyText || "",
    userNotes,
  };

  if (openai && apiKey) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are FollowPilot AI, a highly persuasive B2B sales email copilot.
Write a personalized follow-up email draft.
Return JSON with keys:
- "subject": concise, high-open rate email subject
- "body": professional, concise, personal email body text
- "reason": 1-sentence explanation of why this message fits
- "recommendedTiming": e.g. "Today at 2:00 PM"`,
          },
          {
            role: "user",
            content: JSON.stringify(context),
          },
        ],
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        subject: result.subject || `Follow-up for ${lead.company}`,
        body: result.body || `Hi ${lead.firstName},\n\nFollowing up on our recent conversation...`,
        reason: result.reason || "Contextual follow-up based on prospect intent.",
        recommendedTiming: result.recommendedTiming || "Today at 3:00 PM",
      };
    } catch (err) {
      console.warn("OpenAI Draft generation failed, using intelligent fallback", err);
    }
  }

  // Intelligent Context-Aware Fallback Draft Generator
  let subject = `Follow-up regarding ${lead.company} & FollowPilot`;
  let body = `Hi ${lead.firstName},\n\nI hope you're having a productive week.\n\nFollowing up on our recent exchange regarding ${lead.company}. I wanted to check if you had a chance to review the details we discussed.\n\nWould you have 10 minutes open tomorrow afternoon for a quick check-in?\n\nBest regards,\nVenkatesh`;
  let reason = `Prospect in ${lead.status} stage with ${analysis.intent} intent.`;

  if (lead.company.toLowerCase().includes("acme")) {
    subject = `FollowPilot pricing & security architecture overview for Acme`;
    body = `Hi ${lead.firstName},\n\nFollowing up on your request regarding team pricing and security architecture for Acme Technologies.\n\nOur Pro Business tier covers up to 2,500 leads with full RBAC & team permissions. I've prepared our security overview & SOC2 summary sheet for your evaluation.\n\nWould a 10-minute call tomorrow at 2:00 PM work to answer any questions for your team?\n\nBest regards,\nVenkatesh`;
    reason = "John explicitly requested pricing & security compliance details.";
  } else if (lead.company.toLowerCase().includes("xyz")) {
    subject = `Checking in on the ${lead.company} proposal`;
    body = `Hi ${lead.firstName},\n\nI noticed you had a chance to view our custom proposal yesterday.\n\nDo you have any questions on the workflow triggers or team seat configuration?\n\nHappy to hop on a 5-minute call whenever convenient for you.\n\nBest,\nVenkatesh`;
    reason = "Sarah reviewed the proposal document yesterday.";
  }

  return {
    subject,
    body,
    reason,
    recommendedTiming: "Today at 2:30 PM",
  };
}
