import { conversationService } from "../conversation-service";
import { activityService } from "../../activities/activity-service";
import { leadService } from "../../leads/lead-service";
import { leadContextBuilder } from "../../ai/context-builder";

async function runConversationsTests() {
  console.log("=== Running Phase 5 Conversations & Messages Integration Tests ===");

  const mockContextOrg1: any = {
    userId: "usr_org1_owner",
    activeOrgId: "org_alpha",
    role: "OWNER",
    user: { id: "usr_org1_owner", email: "owner@alpha.com", name: "Alpha Owner" },
  };

  const mockContextOrg2: any = {
    userId: "usr_org2_owner",
    activeOrgId: "org_beta",
    role: "OWNER",
    user: { id: "usr_org2_owner", email: "owner@beta.com", name: "Beta Owner" },
  };

  // Test 1: Create Conversation Thread for Org 1 Lead
  const conv = await conversationService.createConversation(mockContextOrg1, {
    leadId: "lead_101",
    subject: "FollowPilot Enterprise Q4 Contract",
  });

  if (conv.id && conv.organizationId === "org_alpha" && conv.status === "OPEN") {
    console.log("✅ Test 1 Passed: Conversation thread created with default OPEN status and tenant scoping");
  } else {
    console.error("❌ Test 1 Failed: Thread creation error");
  }

  // Test 2: Post Inbound & Outbound Messages and Verify Activity Timeline Auto-Trigger
  const inboundMsg = await conversationService.postMessage(mockContextOrg1, {
    conversationId: conv.id,
    direction: "INBOUND",
    senderEmail: "prospect@alpha.com",
    recipientEmail: "sales@followpilot.io",
    bodyText: "Could you send over the custom prompt agreement?",
  });

  const outboundMsg = await conversationService.postMessage(mockContextOrg1, {
    conversationId: conv.id,
    direction: "OUTBOUND",
    senderEmail: "sales@followpilot.io",
    recipientEmail: "prospect@alpha.com",
    bodyText: "Attached is the agreement. Looking forward to partnering!",
  });

  const activities = await activityService.getLeadActivities(mockContextOrg1, "lead_101");
  const repliedAct = activities.find((a: any) => a.type === "EMAIL_REPLIED");
  const sentAct = activities.find((a: any) => a.type === "EMAIL_SENT");

  if (inboundMsg.id && outboundMsg.id && repliedAct && sentAct) {
    console.log("✅ Test 2 Passed: Posting messages automatically triggers EMAIL_REPLIED and EMAIL_SENT timeline activity events");
  } else {
    console.error("❌ Test 2 Failed: Message posting failed to auto-trigger timeline activities!");
  }

  // Test 3: Multi-Tenant Boundary Isolation for Conversations
  try {
    await conversationService.getConversationDetails(mockContextOrg2, conv.id);
    console.error("❌ Test 3 Failed: Org 2 accessed Org 1 conversation details!");
  } catch (e: any) {
    if (e.message.includes("not found")) {
      console.log("✅ Test 3 Passed: Cross-tenant conversation lookup correctly blocked with NotFoundError");
    } else {
      console.error("❌ Test 3 Failed with unexpected error:", e.message);
    }
  }

  // Test 4: AI Context Builder Bundle Assembly
  const testLead = await leadService.createLead(mockContextOrg1, {
    firstName: "Context",
    lastName: "Tester",
    email: "context.tester@alpha.com",
    company: "Alpha Labs",
  });

  const testConv = await conversationService.createConversation(mockContextOrg1, {
    leadId: testLead.id,
    subject: "Context Integration Contract",
  });

  await conversationService.postMessage(mockContextOrg1, {
    conversationId: testConv.id,
    direction: "OUTBOUND",
    senderEmail: "sales@followpilot.io",
    recipientEmail: "context.tester@alpha.com",
    bodyText: "Here is the proposal text.",
  });

  const bundle = await leadContextBuilder.buildContextBundle(mockContextOrg1, testLead.id);
  if (
    bundle.lead.id === testLead.id &&
    bundle.activities.length > 0 &&
    bundle.conversations.length > 0 &&
    bundle.compiledPromptContext.includes("Context Integration Contract")
  ) {
    console.log("✅ Test 4 Passed: AI Context Builder successfully assembled unified Lead + Activity + Conversation bundle");
  } else {
    console.error("❌ Test 4 Failed: AI Context Builder failed to assemble context bundle!", bundle);
  }
}

runConversationsTests();
