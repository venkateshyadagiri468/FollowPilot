import { calculateLeadScore } from "../score-engine";
import { MockActivity } from "../../store/mock-store";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("=== Running Hybrid Lead Scoring Engine Unit Tests ===");

// Test 1: Base lead score with high intent and reply activity
const lead1 = {
  jobTitle: "VP of Engineering",
  lastActivityAt: new Date().toISOString(),
};

const activities1: MockActivity[] = [
  {
    id: "a1",
    organizationId: "o1",
    leadId: "l1",
    type: "EMAIL_REPLIED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "a2",
    organizationId: "o1",
    leadId: "l1",
    type: "PROPOSAL_VIEWED",
    createdAt: new Date().toISOString(),
  },
];

const result1 = calculateLeadScore(lead1, activities1, "HIGH");
console.log("Test 1 Result Score:", result1.score, "Priority:", result1.priority);
assert(result1.score >= 80, "Expected high score >= 80");
assert(result1.priority === "HIGH", "Expected HIGH priority");

// Test 2: Inactivity decay test (>14 days inactive)
const lead2 = {
  jobTitle: "Software Developer",
  lastActivityAt: new Date(Date.now() - 20 * 86400 * 1000).toISOString(),
};

const result2 = calculateLeadScore(lead2, [], "LOW");
console.log("Test 2 Inactivity Decay Score:", result2.score, "Priority:", result2.priority);
assert(result2.score <= 40, "Expected degraded score <= 40 for inactive lead");

console.log("✅ All Scoring Engine unit tests passed!");
