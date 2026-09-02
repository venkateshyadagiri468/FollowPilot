import { leadRepository } from "../repository";
import { leadService } from "../lead-service";
import { processCsvImport, sanitizeFormulaInjection, CSV_LIMITS } from "../csv-importer";
import { memberService } from "../../organizations/member-service";
import { organizationRepository } from "../../organizations/repository";

async function runHardeningTests() {
  console.log("=== Running Phase 4 Senior Engineering Hardening & Production Audit Tests ===");

  const mockTenantContext: any = {
    userId: "usr_demo_1",
    activeOrgId: "org_demo_1",
    role: "OWNER",
    user: { id: "usr_demo_1", email: "owner@demo.com", name: "Org Owner" },
    activeOrg: { id: "org_demo_1", name: "Demo Org" },
    membership: { id: "mem_1", organizationId: "org_demo_1", userId: "usr_demo_1", role: "OWNER" },
  };

  // Test 1: Soft Deletion Filtering
  const createdLead = await leadService.createLead(mockTenantContext, {
    firstName: "TestSoftDelete",
    lastName: "Lead",
    email: "softdelete@test.com",
  });

  await leadService.deleteLead(mockTenantContext, createdLead.id);
  const foundLead = await leadRepository.findLeadById("org_demo_1", createdLead.id);
  const searchResults = await leadRepository.findLeadsByOrg("org_demo_1", { searchQuery: "softdelete@test.com" });

  if (foundLead === null && searchResults.leads.length === 0) {
    console.log("✅ Test 1 Passed: Soft-deleted leads are excluded from queries and search");
  } else {
    console.error("❌ Test 1 Failed: Soft-deleted lead still visible");
  }

  // Test 2: Cross-Tenant Ownership Guard
  try {
    await leadService.assignLead(mockTenantContext, "lead_demo_1", "usr_external_999");
    console.error("❌ Test 2 Failed: Cross-tenant ownership assignment allowed");
  } catch (e: any) {
    if (e.message.includes("does not belong to organization")) {
      console.log("✅ Test 2 Passed: Cross-tenant ownership assignment blocked");
    } else {
      console.error("❌ Test 2 Failed with unexpected error:", e.message);
    }
  }

  // Test 3: Member Removal Unassigns Assigned Leads
  const newMember = await organizationRepository.addMember("org_demo_1", "usr_assigned_rep", "MEMBER");
  const assignedLead = await leadRepository.createLead("org_demo_1", {
    firstName: "RepAssigned",
    lastName: "Lead",
    email: "repassigned@test.com",
    assignedToUserId: "usr_assigned_rep",
    status: "NEW",
    score: 50,
    priority: "MEDIUM",
    lastActivityAt: new Date().toISOString(),
  });

  await memberService.removeMember({
    orgId: "org_demo_1",
    actorUserId: "usr_demo_1",
    actorRole: "OWNER",
    targetMembershipId: newMember.id,
  });

  const refreshedLead = await leadRepository.findLeadById("org_demo_1", assignedLead.id);
  if (refreshedLead && refreshedLead.assignedToUserId === null) {
    console.log("✅ Test 3 Passed: Member removal automatically unassigned member's leads");
  } else {
    console.error("❌ Test 3 Failed: Lead ownership left orphaned after member removal");
  }

  // Test 4: Formula Injection Sanitization
  const maliciousVal = "=SUM(1+1)";
  const sanitizedVal = sanitizeFormulaInjection(maliciousVal);
  if (sanitizedVal === "'=SUM(1+1)") {
    console.log("✅ Test 4 Passed: Spreadsheet formula injection sanitized successfully");
  } else {
    console.error("❌ Test 4 Failed: Formula injection was not sanitized:", sanitizedVal);
  }

  // Test 5: CSV Security Limits
  const hugeCsvContent = "a".repeat(CSV_LIMITS.MAX_FILE_SIZE_BYTES + 100);
  try {
    processCsvImport(hugeCsvContent, { firstName: "fn", lastName: "ln", email: "em", company: "", phone: "", jobTitle: "", status: "" }, [], "org_demo_1", "usr_demo_1", "User");
    console.error("❌ Test 5 Failed: Oversized CSV file was accepted");
  } catch (e: any) {
    if (e.message.includes("exceeds maximum size limit")) {
      console.log("✅ Test 5 Passed: Oversized CSV file blocked with ValidationError");
    } else {
      console.error("❌ Test 5 Failed with unexpected error:", e.message);
    }
  }

  // Test 6: Bounded Pagination Cap
  const paginatedResult = await leadRepository.findLeadsByOrg("org_demo_1", { pageSize: 500 });
  if (paginatedResult.pageSize === 100) {
    console.log("✅ Test 6 Passed: Unbounded pageSize capped to 100");
  } else {
    console.error("❌ Test 6 Failed: Page size cap failed:", paginatedResult.pageSize);
  }

  // Test 7: Normalized Email Deduplication
  const existingMock: any = [{ email: "john@example.com" }];
  const testCsv = `First Name,Last Name,Email\nJohn,Doe,JOHN@EXAMPLE.COM`;
  const importRes = processCsvImport(testCsv, { firstName: "First Name", lastName: "Last Name", email: "Email", company: "", phone: "", jobTitle: "", status: "" }, existingMock, "org_demo_1", "usr_demo_1", "User", "SKIP_DUPLICATE");

  if (importRes.duplicateCount === 1) {
    console.log("✅ Test 7 Passed: Normalized case-insensitive email duplicate detected");
  } else {
    console.error("❌ Test 7 Failed: Case-insensitive email duplicate missed");
  }
}

runHardeningTests();
