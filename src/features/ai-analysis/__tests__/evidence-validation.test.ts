import { validateEvidenceProvenance } from "../service";
import { AIAnalysisInput, EvidenceItem } from "../schemas";

console.log("=== Running Phase 6 Evidence Provenance Validation Unit Tests ===");

const mockInputContext: AIAnalysisInput = {
  lead: {
    id: "lead_123",
    organizationId: "org_123",
    name: "Alice Smith",
    email: "alice@example.com",
    company: "Acme",
    jobTitle: "VP",
    status: "NEW",
    currentScore: 70,
    priority: "HIGH",
    daysInactive: 1,
  },
  recentActivities: [
    { id: "act_100", type: "EMAIL_SENT", occurredAt: "2026-09-03T10:00:00Z", summary: "email sent" },
    { id: "act_101", type: "NOTE_ADDED", occurredAt: "2026-09-03T10:05:00Z", summary: "pricing note" },
  ],
  conversations: [
    { id: "msg_200", direction: "INBOUND", sentAt: "2026-09-03T10:10:00Z", sanitizedTextSnippet: "Can we talk?" },
  ],
  deterministicSignals: {
    heuristicScore: 70,
    hasRecentInboundReply: true,
    pricingRequested: true,
    proposalSent: false,
    daysSinceLastActivity: 1,
  },
  currentDate: "2026-09-03",
  promptVersion: "v1.0.0-lead-intent",
};

const testEvidence: EvidenceItem[] = [
  // 1. Valid activity source
  { type: "SIGNAL", description: "Pricing note added", sourceType: "ACTIVITY", sourceId: "act_101" },
  // 2. Valid message source
  { type: "SIGNAL", description: "Inbound message received", sourceType: "MESSAGE", sourceId: "msg_200" },
  // 3. Nonexistent / invented activity source ID
  { type: "SIGNAL", description: "Fake call event", sourceType: "ACTIVITY", sourceId: "fake_act_999" },
  // 4. Source belonging to another lead / fake message ID
  { type: "SIGNAL", description: "Other lead message", sourceType: "MESSAGE", sourceId: "msg_other_999" },
  // 5. Valid lead field
  { type: "SIGNAL", description: "Lead score evaluated", sourceType: "LEAD_FIELD", sourceId: "lead_123" },
];

const validated = validateEvidenceProvenance(testEvidence, mockInputContext);

if (validated[0].sourceId !== "act_101") {
  throw new Error("❌ Test 1 Failed: Valid activity sourceId was incorrectly modified");
}
console.log("✅ Test 1 Passed: Valid activity sourceId accepted");

if (validated[1].sourceId !== "msg_200") {
  throw new Error("❌ Test 2 Failed: Valid message sourceId was incorrectly modified");
}
console.log("✅ Test 2 Passed: Valid message sourceId accepted");

if (validated[2].sourceId !== undefined) {
  throw new Error("❌ Test 3 Failed: Nonexistent/invented activity sourceId was not stripped");
}
console.log("✅ Test 3 Passed: Nonexistent/invented activity sourceId stripped");

if (validated[3].sourceId !== undefined) {
  throw new Error("❌ Test 4 Failed: Foreign/invented message sourceId was not stripped");
}
console.log("✅ Test 4 Passed: Foreign/invented message sourceId stripped");

if (validated[4].sourceId !== "lead_123") {
  throw new Error("❌ Test 5 Failed: Valid lead field sourceId was incorrectly modified");
}
console.log("✅ Test 5 Passed: Valid lead field sourceId accepted");
