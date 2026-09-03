import { aiAnalysisRepository } from "../repository";
import { ValidationError } from "@/lib/errors";

console.log("=== Running Phase 6 Lifecycle State Machine & Transition Matrix Unit Tests ===");

async function runLifecycleTests() {
  const orgId = "org_lifecycle_test";
  const leadId = "lead_lifecycle_test";

  // 1. Valid Transition: Create PENDING ➔ PROCESSING ➔ COMPLETED
  const pending = await aiAnalysisRepository.createPendingAnalysis(
    orgId,
    leadId,
    "v1.0.0",
    "gpt-4o-mini-2024-07-18"
  );
  if (pending.status !== "PENDING") {
    throw new Error("❌ Test 1 Failed: Initial status is not PENDING");
  }
  console.log("✅ Test 1 Passed: PENDING status created");

  const processing = await aiAnalysisRepository.updateStatus(pending.id, "PROCESSING");
  if (processing.status !== "PROCESSING") {
    throw new Error("❌ Test 2 Failed: Status did not transition to PROCESSING");
  }
  console.log("✅ Test 2 Passed: PENDING ➔ PROCESSING transition accepted");

  const completed = await aiAnalysisRepository.saveCompletedAnalysis(pending.id, {
    status: "COMPLETED",
    reasoning: "Analysis complete",
    intent: "HIGH",
    recommendedAction: "FOLLOW_UP_NOW",
  });
  if (completed.status !== "COMPLETED") {
    throw new Error("❌ Test 3 Failed: Status did not transition to COMPLETED");
  }
  console.log("✅ Test 3 Passed: PROCESSING ➔ COMPLETED transition accepted");

  // 2. Automatic STALE Invalidation Test
  // Create a second analysis for the same lead
  const pending2 = await aiAnalysisRepository.createPendingAnalysis(
    orgId,
    leadId,
    "v1.0.0",
    "gpt-4o-mini-2024-07-18"
  );
  await aiAnalysisRepository.updateStatus(pending2.id, "PROCESSING");
  const completed2 = await aiAnalysisRepository.saveCompletedAnalysis(pending2.id, {
    status: "COMPLETED",
    reasoning: "Second analysis complete",
    intent: "MEDIUM",
    recommendedAction: "FOLLOW_UP_LATER",
  });

  const firstRecord = await aiAnalysisRepository.getHistoryForLead(orgId, leadId);
  const oldRecord = firstRecord.find((a) => a.id === pending.id);
  if (!oldRecord || oldRecord.status !== "STALE") {
    throw new Error("❌ Test 4 Failed: Older COMPLETED analysis was not automatically marked STALE");
  }
  console.log("✅ Test 4 Passed: Completing new analysis automatically marked previous analysis STALE");

  // 3. Illegal Transition Test: COMPLETED ➔ PENDING should throw ValidationError
  let caughtError = false;
  try {
    await aiAnalysisRepository.updateStatus(completed2.id, "PENDING");
  } catch (err) {
    if (err instanceof ValidationError) {
      caughtError = true;
    }
  }
  if (!caughtError) {
    throw new Error("❌ Test 5 Failed: Illegal COMPLETED ➔ PENDING transition did not throw ValidationError");
  }
  console.log("✅ Test 5 Passed: Illegal COMPLETED ➔ PENDING transition blocked with ValidationError");
}

runLifecycleTests().catch((err) => {
  console.error("❌ Lifecycle Unit Test Failed:", err);
  process.exit(1);
});
