export interface ConversationEntity {
  id: string;
  organizationId: string;
  leadId: string;
  subject: string;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface MessageEntity {
  id: string;
  conversationId: string;
  direction: "INBOUND" | "OUTBOUND";
  senderEmail: string;
  recipientEmail: string;
  bodyText: string;
  bodyHtml?: string | null;
  metadata?: Record<string, any> | null;
  sentAt: string;
}

export class ConversationRepository {
  private static conversationsStore: ConversationEntity[] = [
    {
      id: "conv_101",
      organizationId: "org_demo_1",
      leadId: "lead_101",
      subject: "FollowPilot Enterprise Pricing Inquiry",
      status: "OPEN",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  private static messagesStore: MessageEntity[] = [
    {
      id: "msg_101",
      conversationId: "conv_101",
      direction: "INBOUND",
      senderEmail: "sarah@acme.com",
      recipientEmail: "sales@followpilot.io",
      bodyText: "Hi team, we're looking to roll out FollowPilot across 50 sales reps. What does pricing look like?",
      sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "msg_102",
      conversationId: "conv_101",
      direction: "OUTBOUND",
      senderEmail: "alex@followpilot.io",
      recipientEmail: "sarah@acme.com",
      bodyText: "Thanks for reaching out Sarah! For 50 seats, our Enterprise tier includes dedicated AI prompt customization and priority Resend infrastructure integration. Would Tuesday 2 PM work for a quick demo?",
      sentAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  async createConversation(
    orgId: string,
    data: { leadId: string; subject: string }
  ): Promise<ConversationEntity> {
    const newConv: ConversationEntity = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      leadId: data.leadId,
      subject: data.subject.trim(),
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ConversationRepository.conversationsStore.push(newConv);
    return newConv;
  }

  async findConversationsByOrg(
    orgId: string,
    filter?: { leadId?: string; status?: ConversationEntity["status"] }
  ): Promise<ConversationEntity[]> {
    return ConversationRepository.conversationsStore.filter((c) => {
      if (c.organizationId !== orgId) return false;
      if (filter?.leadId && c.leadId !== filter.leadId) return false;
      if (filter?.status && c.status !== filter.status) return false;
      return true;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async findConversationById(
    orgId: string,
    conversationId: string
  ): Promise<ConversationEntity | null> {
    const match = ConversationRepository.conversationsStore.find(
      (c) => c.organizationId === orgId && c.id === conversationId
    );
    return match || null;
  }

  async addMessage(
    orgId: string,
    conversationId: string,
    data: {
      direction: "INBOUND" | "OUTBOUND";
      senderEmail: string;
      recipientEmail: string;
      bodyText: string;
      bodyHtml?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<MessageEntity> {
    const conv = await this.findConversationById(orgId, conversationId);
    if (!conv) {
      throw new Error(`Conversation ${conversationId} not found in organization ${orgId}`);
    }

    const newMessage: MessageEntity = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      direction: data.direction,
      senderEmail: data.senderEmail.trim().toLowerCase(),
      recipientEmail: data.recipientEmail.trim().toLowerCase(),
      bodyText: data.bodyText,
      bodyHtml: data.bodyHtml || null,
      metadata: data.metadata || null,
      sentAt: new Date().toISOString(),
    };

    ConversationRepository.messagesStore.push(newMessage);
    conv.updatedAt = new Date().toISOString();

    return newMessage;
  }

  async getMessagesForConversation(
    orgId: string,
    conversationId: string
  ): Promise<MessageEntity[]> {
    const conv = await this.findConversationById(orgId, conversationId);
    if (!conv) {
      throw new Error(`Conversation ${conversationId} not found in organization ${orgId}`);
    }

    return ConversationRepository.messagesStore
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }

  async updateStatus(
    orgId: string,
    conversationId: string,
    status: ConversationEntity["status"]
  ): Promise<ConversationEntity> {
    const conv = await this.findConversationById(orgId, conversationId);
    if (!conv) {
      throw new Error(`Conversation ${conversationId} not found in organization ${orgId}`);
    }

    conv.status = status;
    conv.updatedAt = new Date().toISOString();
    return conv;
  }
}

export const conversationRepository = new ConversationRepository();
