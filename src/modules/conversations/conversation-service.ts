import { TenantContext } from "../auth/tenant-context";
import {
  conversationRepository,
  ConversationEntity,
  MessageEntity,
} from "./conversation-repository";
import { activityService } from "../activities/activity-service";
import { requirePermission } from "@/lib/permissions";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logging";

export class ConversationService {
  async createConversation(
    context: TenantContext,
    input: { leadId: string; subject: string }
  ): Promise<ConversationEntity> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "create_leads"
    );

    if (!input.subject.trim()) {
      throw new ValidationError("Subject line cannot be empty");
    }

    const conversation = await conversationRepository.createConversation(
      context.activeOrgId,
      input
    );

    logger.info("conversation.created", {
      event: "conversation.created",
      orgId: context.activeOrgId,
      leadId: input.leadId,
      conversationId: conversation.id,
      actorUserId: context.userId,
    });

    return conversation;
  }

  async getConversations(
    context: TenantContext,
    filter?: { leadId?: string; status?: ConversationEntity["status"] }
  ): Promise<ConversationEntity[]> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "view_leads"
    );

    return conversationRepository.findConversationsByOrg(context.activeOrgId, filter);
  }

  async getConversationDetails(
    context: TenantContext,
    conversationId: string
  ): Promise<{ conversation: ConversationEntity; messages: MessageEntity[] }> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "view_leads"
    );

    const conv = await conversationRepository.findConversationById(
      context.activeOrgId,
      conversationId
    );
    if (!conv) {
      throw new NotFoundError(`Conversation ${conversationId} not found`);
    }

    const messages = await conversationRepository.getMessagesForConversation(
      context.activeOrgId,
      conversationId
    );

    return { conversation: conv, messages };
  }

  async postMessage(
    context: TenantContext,
    input: {
      conversationId: string;
      direction: "INBOUND" | "OUTBOUND";
      senderEmail: string;
      recipientEmail: string;
      bodyText: string;
      bodyHtml?: string;
    }
  ): Promise<MessageEntity> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "edit_leads"
    );

    if (!input.bodyText.trim()) {
      throw new ValidationError("Message body cannot be empty");
    }

    const conv = await conversationRepository.findConversationById(
      context.activeOrgId,
      input.conversationId
    );
    if (!conv) {
      throw new NotFoundError(`Conversation ${input.conversationId} not found`);
    }

    const message = await conversationRepository.addMessage(
      context.activeOrgId,
      input.conversationId,
      input
    );

    // Atomically trigger Activity Timeline Event
    const activityType = input.direction === "OUTBOUND" ? "EMAIL_SENT" : "EMAIL_REPLIED";
    await activityService.logActivity(context, {
      leadId: conv.leadId,
      type: activityType,
      metadata: {
        conversationId: conv.id,
        messageId: message.id,
        subject: conv.subject,
        snippet: input.bodyText.substring(0, 120),
      },
    });

    logger.info("message.posted", {
      event: "message.posted",
      orgId: context.activeOrgId,
      conversationId: conv.id,
      leadId: conv.leadId,
      direction: input.direction,
      actorUserId: context.userId,
    });

    return message;
  }

  async updateConversationStatus(
    context: TenantContext,
    conversationId: string,
    status: ConversationEntity["status"]
  ): Promise<ConversationEntity> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "edit_leads"
    );

    const updated = await conversationRepository.updateStatus(
      context.activeOrgId,
      conversationId,
      status
    );

    logger.info("conversation.status_updated", {
      event: "conversation.status_updated",
      orgId: context.activeOrgId,
      conversationId,
      status,
      actorUserId: context.userId,
    });

    return updated;
  }
}

export const conversationService = new ConversationService();
