import { MockActivity, MockLead } from "../store/mock-store";

export interface ScoreBreakdown {
  score: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  signals: {
    label: string;
    points: number;
  }[];
}

export function calculateLeadScore(
  lead: Partial<MockLead>,
  activities: MockActivity[] = [],
  aiIntent: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN" = "UNKNOWN"
): ScoreBreakdown {
  let score = 30; // Base starting score
  const signals: { label: string; points: number }[] = [];

  // 1. Analyze Activities
  const activityTypes = activities.map((a) => a.type);

  if (activityTypes.includes("EMAIL_REPLIED")) {
    score += 20;
    signals.push({ label: "Replied to email outreach", points: 20 });
  }

  if (activityTypes.includes("PROPOSAL_VIEWED")) {
    score += 15;
    signals.push({ label: "Viewed proposal document", points: 15 });
  }

  if (activityTypes.includes("PROPOSAL_SENT")) {
    score += 10;
    signals.push({ label: "Proposal sent to prospect", points: 10 });
  }

  if (activityTypes.includes("EMAIL_CLICKED")) {
    score += 12;
    signals.push({ label: "Clicked link in email", points: 12 });
  } else if (activityTypes.includes("EMAIL_OPENED")) {
    score += 8;
    signals.push({ label: "Opened email message", points: 8 });
  }

  if (activityTypes.includes("CALL_COMPLETED")) {
    score += 10;
    signals.push({ label: "Completed sales call", points: 10 });
  }

  // 2. Check ICP (Ideal Customer Profile) Match
  const title = (lead.jobTitle || "").toLowerCase();
  const icpTitles = ["vp", "vice president", "head", "director", "founder", "ceo", "cto", "cmo", "owner"];
  const isIcpMatch = icpTitles.some((t) => title.includes(t));

  if (isIcpMatch) {
    score += 15;
    signals.push({ label: "Target ICP Executive Match", points: 15 });
  }

  // 3. AI Intent Modifier
  if (aiIntent === "HIGH") {
    score += 20;
    signals.push({ label: "AI Analyzed High Buyer Intent", points: 20 });
  } else if (aiIntent === "MEDIUM") {
    score += 10;
    signals.push({ label: "AI Analyzed Moderate Intent", points: 10 });
  }

  // 4. Inactivity Decay (-15 if no activity for >14 days)
  if (lead.lastActivityAt) {
    const daysInactive =
      (Date.now() - new Date(lead.lastActivityAt).getTime()) / (1000 * 3600 * 24);
    if (daysInactive > 14) {
      score -= 15;
      signals.push({ label: "Inactive for >14 days", points: -15 });
    }
  }

  // Clamp final score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (finalScore >= 75) {
    priority = "HIGH";
  } else if (finalScore >= 55) {
    priority = "MEDIUM";
  }

  return {
    score: finalScore,
    priority,
    signals,
  };
}
