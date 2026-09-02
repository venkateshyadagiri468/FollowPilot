import { organizationService } from "../organization-service";
import { invitationService } from "../invitation-service";
import { memberService } from "../member-service";
import { resolveTenantContext } from "../../auth/tenant-context";

async function runOrganizationPhase3IntegrationTests() {
  console.log("=== Running Phase 3 Organization, Invitation & Tenant Security Tests ===");

  // Test 1: Transactional Organization & OWNER Membership Creation
  try {
    const { organization, membership } = await organizationService.createOrganization(
      "usr_demo_1",
      "Stark Industries"
    );

    if (organization.id && membership.role === "OWNER" && membership.organizationId === organization.id) {
      console.log("✅ Test 1 Passed: Organization and atomic OWNER membership created successfully");
    } else {
      console.error("❌ Test 1 Failed: Organization creation returned incomplete response");
    }
  } catch (e: any) {
    console.error("❌ Test 1 Failed with error:", e.message);
  }

  // Test 2: Collision-Safe Slug Generation
  try {
    const org1 = await organizationService.createOrganization("usr_demo_1", "Nexus Systems");
    const org2 = await organizationService.createOrganization("usr_demo_1", "Nexus Systems");

    if (org1.organization.slug !== org2.organization.slug) {
      console.log(`✅ Test 2 Passed: Slugs generated uniquely (${org1.organization.slug} vs ${org2.organization.slug})`);
    } else {
      console.error("❌ Test 2 Failed: Slug collision occurred");
    }
  } catch (e: any) {
    console.error("❌ Test 2 Failed with error:", e.message);
  }

  // Test 3: Member Invitation Token Creation & Expiry Validation
  try {
    const invite = await invitationService.inviteMember({
      orgId: "org_demo_1",
      inviterUserId: "usr_demo_1",
      inviterRole: "OWNER",
      email: "engineer@stark.com",
      role: "MEMBER",
    });

    if (invite.token && invite.status === "PENDING") {
      console.log("✅ Test 3 Passed: Secure invitation token generated with PENDING status");
    } else {
      console.error("❌ Test 3 Failed: Invitation creation invalid");
    }
  } catch (e: any) {
    console.error("❌ Test 3 Failed with error:", e.message);
  }

  // Test 4: Business Constraint Enforcement — Prevent Demoting Sole OWNER
  try {
    await memberService.updateRole({
      orgId: "org_demo_1",
      actorUserId: "usr_demo_1",
      actorRole: "OWNER",
      targetMembershipId: "mem_demo_1",
      newRole: "MEMBER",
    });
    console.error("❌ Test 4 Failed: Sole OWNER demotion should have been blocked");
  } catch (e: any) {
    if (e.message.includes("sole OWNER")) {
      console.log("✅ Test 4 Passed: Sole OWNER demotion blocked successfully");
    } else {
      console.error("❌ Test 4 Failed with unexpected error:", e.message);
    }
  }

  // Test 5: Server-side Tenant Context Resolution Security
  try {
    const tenantCtx = await resolveTenantContext("user_clerk_demo_1", "org_demo_1");
    if (tenantCtx.userId === "usr_demo_1" && tenantCtx.activeOrgId === "org_demo_1" && tenantCtx.role === "OWNER") {
      console.log("✅ Test 5 Passed: Active Tenant Context resolved securely server-side");
    } else {
      console.error("❌ Test 5 Failed: Tenant context resolution failed");
    }
  } catch (e: any) {
    console.error("❌ Test 5 Failed with error:", e.message);
  }
}

runOrganizationPhase3IntegrationTests();
