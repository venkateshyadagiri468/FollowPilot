import {
  isValidStatusTransition,
  validateStatusTransition,
  getAllowedNextStatuses,
} from "../lead-state-machine";

async function runLeadStateMachineTests() {
  console.log("=== Running Lead Status State Machine Unit Tests ===");

  // Test 1: Valid Status Transitions
  const valid1 = isValidStatusTransition("NEW", "CONTACTED");
  const valid2 = isValidStatusTransition("CONTACTED", "QUALIFIED");
  const valid3 = isValidStatusTransition("QUALIFIED", "WON");

  if (valid1 && valid2 && valid3) {
    console.log("✅ Test 1 Passed: Valid state machine transitions accepted");
  } else {
    console.error("❌ Test 1 Failed: Valid state transitions rejected");
  }

  // Test 2: Invalid Status Jump (NEW directly to WON)
  try {
    validateStatusTransition("NEW", "WON");
    console.error("❌ Test 2 Failed: Illegal state jump (NEW -> WON) allowed");
  } catch (e: any) {
    if (e.message.includes("Invalid lead status transition")) {
      console.log("✅ Test 2 Passed: Illegal state jump (NEW -> WON) blocked with ValidationError");
    } else {
      console.error("❌ Test 2 Failed with unexpected error:", e.message);
    }
  }

  // Test 3: Allowed Next Statuses Lookup
  const nextFromContacted = getAllowedNextStatuses("CONTACTED");
  if (nextFromContacted.includes("REPLIED") && nextFromContacted.includes("QUALIFIED")) {
    console.log("✅ Test 3 Passed: Allowed next statuses retrieved correctly");
  } else {
    console.error("❌ Test 3 Failed: Allowed next statuses invalid");
  }
}

runLeadStateMachineTests();
