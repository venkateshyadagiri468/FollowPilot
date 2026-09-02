import { activityService } from "../activity-service";
import { activityRepository } from "../activity-repository";

async function runActivitiesTests() {
  console.log("=== Running Phase 5 Lead Activities Integration Tests ===");

  const mockContextOrg1: any = {
    userId: "usr_org1_owner",
    activeOrgId: "org_alpha",
    role: "OWNER",
  };

  const mockContextOrg2: any = {
    userId: "usr_org2_owner",
    activeOrgId: "org_beta",
    role: "OWNER",
  };

  // Test 1: Log Activity for Org 1 Lead
  const act1 = await activityService.logActivity(mockContextOrg1, {
    leadId: "lead_alpha_101",
    type: "NOTE_ADDED",
    metadata: { note: "Discussed Q4 contract renewal" },
  });

  if (act1.leadId === "lead_alpha_101" && act1.organizationId === "org_alpha") {
    console.log("✅ Test 1 Passed: Activity logged successfully with correct tenant scoping");
  } else {
    console.error("❌ Test 1 Failed: Activity logging scoping error");
  }

  // Test 2: Append-only Immutability Verification
  const repoKeys = Object.keys(activityRepository);
  const hasMutationMethods = repoKeys.includes("deleteActivity") || repoKeys.includes("updateActivity");
  if (!hasMutationMethods) {
    console.log("✅ Test 2 Passed: Activity timeline is strictly append-only (no update/delete methods)");
  } else {
    console.error("❌ Test 2 Failed: Activity mutation methods found");
  }

  // Test 3: Multi-tenant Activity Retrieval Isolation
  const org1Activities = await activityService.getLeadActivities(mockContextOrg1, "lead_alpha_101");
  const org2Activities = await activityService.getLeadActivities(mockContextOrg2, "lead_alpha_101");

  if (org1Activities.length > 0 && org2Activities.length === 0) {
    console.log("✅ Test 3 Passed: Cross-tenant activity isolation verified (Org 2 cannot query Org 1 activities)");
  } else {
    console.error("❌ Test 3 Failed: Cross-tenant activity leakage!");
  }
}

runActivitiesTests();
