import {
  hasPermission,
  requireAuth,
  requireOrganizationMember,
  requirePermission,
} from "../index";

function runPermissionIntegrationTests() {
  console.log("=== Running Multi-Tenant RBAC & Isolation Integration Tests ===");

  // Test 1: Cross-Organization Isolation
  try {
    requireOrganizationMember("user_100", "org_B", "org_A");
    console.error("❌ Test 1 Failed: Cross-organization access should have been blocked");
  } catch (e: any) {
    if (e.message.includes("Multi-tenant boundary violation")) {
      console.log("✅ Test 1 Passed: Cross-organization boundary violation blocked");
    } else {
      console.error("❌ Test 1 Failed with unexpected error:", e.message);
    }
  }

  // Test 2: Role Permission Matrix - Viewer Restrictions
  const viewerCanCreateLead = hasPermission("VIEWER", "create_leads");
  const viewerCanViewLead = hasPermission("VIEWER", "view_leads");
  if (!viewerCanCreateLead && viewerCanViewLead) {
    console.log("✅ Test 2 Passed: VIEWER role restricted from lead creation but allowed to view");
  } else {
    console.error("❌ Test 2 Failed: VIEWER role matrix check failed");
  }

  // Test 3: Member Billing Permission Restriction
  try {
    requirePermission("user_200", "org_A", "org_A", "MEMBER", "manage_billing");
    console.error("❌ Test 3 Failed: MEMBER should not manage billing");
  } catch (e: any) {
    if (e.message.includes("lacks mandatory permission")) {
      console.log("✅ Test 3 Passed: MEMBER role restricted from managing billing");
    } else {
      console.error("❌ Test 3 Failed with unexpected error:", e.message);
    }
  }

  // Test 4: Owner Permission Privileges
  try {
    requirePermission("user_300", "org_A", "org_A", "OWNER", "manage_billing");
    console.log("✅ Test 4 Passed: OWNER granted full billing management permission");
  } catch (e: any) {
    console.error("❌ Test 4 Failed: OWNER permission check failed", e.message);
  }
}

runPermissionIntegrationTests();
