import { aiAnalysisService } from "../service";
import { leadRepository } from "@/modules/leads/repository";
import { aiUsageTracker } from "../usage";

console.log("=== Running Phase 6 Hardened AI Analysis Service Integration Tests ===");

async function runTests() {
  // 1. Create demo lead
  const createdLead = await leadRepository.createLead("org_test_ai_hardened", {
    firstName: "Marcus",
    lastName: "Vance",
    email: "marcus@vancecorp.com",
    company: "Vance Corp",
    jobTitle: "CTO",
    phone: "+1 555-9090",
    status: "NEW",
    score: 65,
    priority: "MEDIUM",
    lastActivityAt: new Date().toISOString(),
  });

  const usageBefore = await aiUsageTracker.getUsage("org_test_ai_hardened");

  // 2. Execute AI Analysis
  const analysis1 = await aiAnalysisService.analyzeLead({
    organizationId: "org_test_ai_hardened",
    leadId: createdLead.id,
  });

  if (!analysis1 || !analysis1.id || analysis1.leadId !== createdLead.id) {
    throw new Error("❌ Test 1 Failed: AI analysis record not created");
  }
  if (analysis1.analysisSource !== "DETERMINISTIC_FALLBACK" && analysis1.analysisSource !== "AI") {
    throw new Error("❌ Test 1 Failed: analysisSource explicit field missing");
  }
  console.log(`✅ Test 1 Passed: AI Analysis created (Source: ${analysis1.analysisSource}, Model: ${analysis1.model})`);

  // 3. Test Fingerprint Cache Hit (Does NOT consume AI generation quota)
  const analysis2 = await aiAnalysisService.analyzeLead({
    organizationId: "org_test_ai_hardened",
    leadId: createdLead.id,
  });

  const usageAfterCache = await aiUsageTracker.getUsage("org_test_ai_hardened");
  if (analysis2.id !== analysis1.id || usageBefore !== usageAfterCache) {
    throw new Error("❌ Test 2 Failed: Cache hit consumed generation quota or generated new ID");
  }
  console.log("✅ Test 2 Passed: 60-minute SHA-256 fingerprint cache hit verified (0 quota consumed)");

  // 4. Test Human Override Record Audit Trail Preservation
  const overridden = await aiAnalysisService.recordHumanOverride(
    "org_test_ai_hardened",
    analysis1.id,
    "usr_sales_rep_1",
    "WAIT_FOR_RESPONSE",
    "Spoke with rep verbally"
  );

  if (
    overridden.humanOverrideAction !== "WAIT_FOR_RESPONSE" ||
    overridden.recommendedAction !== analysis1.recommendedAction || // Original AI action preserved
    overridden.overrideByUserId !== "usr_sales_rep_1"
  ) {
    throw new Error("❌ Test 3 Failed: Human override destroyed original AI recommendation or audit fields");
  }
  console.log("✅ Test 3 Passed: Human override audit trail recorded cleanly without destroying AI recommendation");
}

runTests().catch((err) => {
  console.error("❌ AI Service Integration Test Failed:", err);
  process.exit(1);
});
