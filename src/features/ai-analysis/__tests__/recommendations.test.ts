import { safetyRulesEngine, MIN_RECOMMENDED_DELAY_HOURS, MAX_RECOMMENDED_DELAY_HOURS } from "../recommendations";
import { LeadEntity } from "@/modules/leads/repository";
import { AIAnalysisOutput } from "../schemas";

console.log("=== Running Phase 6 Hardened Business Safety Rules Unit Tests ===");

const baseLead: LeadEntity = {
  id: "lead_test",
  organizationId: "org_test",
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@company.com",
  status: "NEW",
  score: 60,
  priority: "MEDIUM",
  lastActivityAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const rawAiOutput: AIAnalysisOutput = {
  intent: "HIGH",
  intentConfidence: 0.9,
  sentiment: "POSITIVE",
  sentimentConfidence: 0.85,
  urgency: "HIGH",
  reasoningSummary: "Prospect is interested in demo.",
  evidence: [{ type: "DEMO_REQUEST", description: "Requested demo on site", sourceType: "MESSAGE", sourceId: "msg_99" }],
  recommendedAction: "FOLLOW_UP_NOW",
  recommendedDelayHours: 1, // Below minimum 2h
  risks: [],
  calculatedScore: 85,
};

// Test 1: Delay hours clamping to minimum bound (2 hours)
const res1 = safetyRulesEngine.applyBusinessSafetyRules(baseLead, rawAiOutput);
if (res1.recommendedDelayHours !== MIN_RECOMMENDED_DELAY_HOURS) {
  throw new Error(`❌ Test 1 Failed: Delay hours was not clamped to minimum ${MIN_RECOMMENDED_DELAY_HOURS}h`);
}
console.log(`✅ Test 1 Passed: Recommended delay hours clamped to minimum safe bound (${MIN_RECOMMENDED_DELAY_HOURS}h)`);

// Test 2: Closed-WON lead overrides recommendation to NO_ACTION
const wonLead = { ...baseLead, status: "WON" as const };
const res2 = safetyRulesEngine.applyBusinessSafetyRules(wonLead, rawAiOutput);
if (res2.recommendedAction !== "NO_ACTION" || !res2.safetyOverrideApplied) {
  throw new Error("❌ Test 2 Failed: Closed-WON lead did not trigger NO_ACTION safety override");
}
console.log("✅ Test 2 Passed: Closed-WON lead safely overridden to NO_ACTION");

// Test 3: UNKNOWN intent overrides aggressive FOLLOW_UP_NOW to WAIT_FOR_RESPONSE
const unknownAiOutput: AIAnalysisOutput = {
  ...rawAiOutput,
  intent: "UNKNOWN",
  recommendedAction: "FOLLOW_UP_NOW",
  recommendedDelayHours: 4,
};
const res3 = safetyRulesEngine.applyBusinessSafetyRules(baseLead, unknownAiOutput);
if (res3.recommendedAction !== "WAIT_FOR_RESPONSE" || !res3.safetyOverrideApplied) {
  throw new Error("❌ Test 3 Failed: UNKNOWN intent failed to override aggressive action to WAIT_FOR_RESPONSE");
}
console.log("✅ Test 3 Passed: UNKNOWN intent conservatively overridden to WAIT_FOR_RESPONSE");
