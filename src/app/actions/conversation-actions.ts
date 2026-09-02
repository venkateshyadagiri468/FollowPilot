"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { conversationService } from "@/modules/conversations/conversation-service";
import { TenantContext } from "@/modules/auth/tenant-context";

function buildTenantContext(context: { userId: string; orgId: string; role: any }): TenantContext {
  return {
    userId: context.userId,
    activeOrgId: context.orgId,
    role: context.role,
    user: {
      id: context.userId,
      clerkUserId: `clerk_${context.userId}`,
      email: "user@organization.com",
      name: "Workspace Member",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    activeOrg: {
      id: context.orgId,
      name: "Workspace",
      slug: "workspace",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    membership: {
      id: `mem_${context.userId}`,
      organizationId: context.orgId,
      userId: context.userId,
      role: context.role,
      joinedAt: new Date().toISOString(),
    },
  };
}

const createConversationSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  subject: z.string().min(1, "Subject is required"),
});

export const createConversationAction = createSafeAction(
  createConversationSchema,
  async (input, context) => {
    const tenantCtx = buildTenantContext(context);
    return conversationService.createConversation(tenantCtx, input);
  },
  { requiredPermission: "create_leads" }
);

const postMessageSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  senderEmail: z.string().email("Invalid sender email"),
  recipientEmail: z.string().email("Invalid recipient email"),
  bodyText: z.string().min(1, "Message content cannot be empty"),
  bodyHtml: z.string().optional(),
});

export const postMessageAction = createSafeAction(
  postMessageSchema,
  async (input, context) => {
    const tenantCtx = buildTenantContext(context);
    return conversationService.postMessage(tenantCtx, input);
  },
  { requiredPermission: "edit_leads" }
);

const updateConversationStatusSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  status: z.enum(["OPEN", "CLOSED", "ARCHIVED"]),
});

export const updateConversationStatusAction = createSafeAction(
  updateConversationStatusSchema,
  async (input, context) => {
    const tenantCtx = buildTenantContext(context);
    return conversationService.updateConversationStatus(
      tenantCtx,
      input.conversationId,
      input.status
    );
  },
  { requiredPermission: "edit_leads" }
);
