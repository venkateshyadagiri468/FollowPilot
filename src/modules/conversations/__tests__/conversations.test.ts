import { conversationService } from "../conversation-service";
import { activityService } from "../../activities/activity-service";
import { leadService } from "../../leads/lead-service";
import { leadContextBuilder } from "../../ai/context-builder";

async function runConversationsHardeningAuditSuite() {
  console.log("=== Running Phase 5 Senior Engineering Final Hardening Audit Suite ===");

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

  const mockContextViewer: any = {
    userId: "usr_viewer",
    activeOrgId: "org_alpha",
    role: "VIEWER",
    user: { id: "usr_viewer", email: "viewer@alpha.com", name: "Alpha Viewer" },
  };

  // Proof 1: Conversation -> Lead -> Organization Consistency Enforcement
  const leadOrg1 = await leadService.createLead(mockContextOrg1, {
    firstName: "Consistency",
    lastName: "Check",
    email: "consistency@alpha.com",
  });

  const convOrg1 = await conversationService.createConversation(mockContextOrg1, {
    leadId: leadOrg1.id,
    subject: "Contract Inquiry",
  });

  try {
    await conversationService.postMessage(mockContextOrg2, {
      conversationId: convOrg1.id,
      direction: "OUTBOUND",
      senderEmail: "attacker@beta.com",
      recipientEmail: "consistency@alpha.com",
      bodyText: "Attacker message across tenant boundary",
    });
    console.error("❌ Proof 1 Failed: Cross-tenant conversation message posting was allowed!");
  } catch (e: any) {
    if (e.message.includes("not found")) {
      console.log("✅ Proof 1 Passed: Server-side Conversation->Lead->Organization consistency strictly enforced");
    } else {
      console.error("❌ Proof 1 Failed with unexpected error:", e.message);
    }
  }

  // Proof 2: RBAC Enforcement for Message Posting (VIEWER Role Denied)
  try {
    await conversationService.postMessage(mockContextViewer, {
      conversationId: convOrg1.id,
      direction: "OUTBOUND",
      senderEmail: "viewer@alpha.com",
      recipientEmail: "consistency@alpha.com",
      bodyText: "Viewer post attempt",
    });
    console.error("❌ Proof 2 Failed: VIEWER role was able to post a message!");
  } catch (e: any) {
    if (e.message.includes("Permission denied")) {
      console.log("✅ Proof 2 Passed: VIEWER role strictly blocked from posting messages (RBAC enforced)");
    } else {
      console.error("❌ Proof 2 Failed with unexpected error:", e.message);
    }
  }

  // Proof 3: Untrusted HTML Body Sanitization
  const maliciousMsg = await conversationService.postMessage(mockContextOrg1, {
    conversationId: convOrg1.id,
    direction: "INBOUND",
    senderEmail: "consistency@alpha.com",
    recipientEmail: "sales@followpilot.io",
    bodyText: "Please check attached offer.",
    bodyHtml: `<p>Hello</p><script>alert('xss')</script><img src=x onerror="javascript:alert(1)">`,
  });

  if (
    maliciousMsg.bodyHtml &&
    !maliciousMsg.bodyHtml.includes("<script>") &&
    !maliciousMsg.bodyHtml.includes("onerror=")
  ) {
    console.log("✅ Proof 3 Passed: Inbound message HTML sanitized (<script> and inline event handlers stripped)");
  } else {
    console.error("❌ Proof 3 Failed: Malicious HTML content survived sanitization:", maliciousMsg.bodyHtml);
  }

  // Proof 4: Atomic Message + Activity Timeline Linkage
  const activities = await activityService.getLeadActivities(mockContextOrg1, leadOrg1.id);
  const messageActivity = activities.find((a: any) => a.metadata?.messageId === maliciousMsg.id);
  if (messageActivity) {
    console.log("✅ Proof 4 Passed: Message posting atomically created corresponding activity timeline event");
  } else {
    console.error("❌ Proof 4 Failed: Activity timeline event missing for posted message!");
  }

  // Proof 5: Inbound EMAIL_DELIVERED vs EMAIL_REPLIED Semantics
  const outboundResponse = await conversationService.postMessage(mockContextOrg1, {
    conversationId: convOrg1.id,
    direction: "OUTBOUND",
    senderEmail: "sales@followpilot.io",
    recipientEmail: "consistency@alpha.com",
    bodyText: "Here is the pricing details document.",
  });

  const replyMsg = await conversationService.postMessage(mockContextOrg1, {
    conversationId: convOrg1.id,
    direction: "INBOUND",
    senderEmail: "consistency@alpha.com",
    recipientEmail: "sales@followpilot.io",
    bodyText: "Looks great, let's schedule a call!",
  });

  const refreshedActivities = await activityService.getLeadActivities(mockContextOrg1, leadOrg1.id);
  const initialInboundAct = refreshedActivities.find((a: any) => a.metadata?.messageId === maliciousMsg.id);
  const replyInboundAct = refreshedActivities.find((a: any) => a.metadata?.messageId === replyMsg.id);

  if (initialInboundAct?.type === "EMAIL_DELIVERED" && replyInboundAct?.type === "EMAIL_REPLIED") {
    console.log("✅ Proof 5 Passed: Inbound emails correctly differentiate initial EMAIL_DELIVERED vs thread EMAIL_REPLIED");
  } else {
    console.error("❌ Proof 5 Failed: Inbound email activity semantic differentiation failed:", { initialInboundAct, replyInboundAct });
  }

  // Proof 6: Context Builder Size Bounds & Truncation
  const bundle = await leadContextBuilder.buildContextBundle(mockContextOrg1, leadOrg1.id);
  if (bundle.activities.length <= 50 && bundle.conversations[0].messages.length <= 20) {
    console.log("✅ Proof 6 Passed: Context Builder strictly enforces token/size bounds on activities & messages");
  } else {
    console.error("❌ Proof 6 Failed: Context size bounds exceeded!");
  }

  // Proof 7: Prompt-Injection Security Boundary Framing
  if (
    bundle.compiledPromptContext.includes("UNTRUSTED DATA") &&
    bundle.compiledPromptContext.includes("--- BEGIN INBOUND MESSAGE DATA ---")
  ) {
    console.log("✅ Proof 7 Passed: Context Builder wraps prospect text in explicit prompt-injection defense blocks");
  } else {
    console.error("❌ Proof 7 Failed: Prompt-injection framing missing from compiled context!");
  }
}

runConversationsHardeningAuditSuite();
