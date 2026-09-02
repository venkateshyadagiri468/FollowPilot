import { TenantContext } from "../auth/tenant-context";
import { leadService } from "../leads/lead-service";
import { activityService } from "../activities/activity-service";
import { conversationService } from "../conversations/conversation-service";
import { LeadEntity } from "../leads/repository";
import { ActivityEntity } from "../activities/activity-repository";
import { ConversationEntity, MessageEntity } from "../conversations/conversation-repository";

export interface LeadContextBundle {
  lead: LeadEntity;
  activities: ActivityEntity[];
  conversations: Array<{
    thread: ConversationEntity;
    messages: MessageEntity[];
  }>;
  compiledPromptContext: string;
}

export class LeadContextBuilder {
  async buildContextBundle(
    context: TenantContext,
    leadId: string
  ): Promise<LeadContextBundle> {
    // 1. Fetch Lead Details
    const leadDetails = await leadService.getLeadDetails(context, leadId);
    const lead = leadDetails.lead;

    // 2. Fetch Lead Activities Timeline
    const activities = await activityService.getLeadActivities(context, leadId);

    // 3. Fetch Conversation Threads & Messages
    const threads = await conversationService.getConversations(context, { leadId });
    const conversations = await Promise.all(
      threads.map(async (thread) => {
        const details = await conversationService.getConversationDetails(context, thread.id);
        return {
          thread: details.conversation,
          messages: details.messages,
        };
      })
    );

    // 4. Compile Unified Structured Text for AI Prompt Injection
    const compiledPromptContext = this.compilePromptText(lead, activities, conversations);

    return {
      lead,
      activities,
      conversations,
      compiledPromptContext,
    };
  }

  private compilePromptText(
    lead: LeadEntity,
    activities: ActivityEntity[],
    conversations: Array<{ thread: ConversationEntity; messages: MessageEntity[] }>
  ): string {
    const lines: string[] = [];

    lines.push(`=== LEAD PROFILE ===`);
    lines.push(`ID: ${lead.id}`);
    lines.push(`Name: ${lead.firstName} ${lead.lastName}`);
    lines.push(`Email: ${lead.email}`);
    lines.push(`Company: ${lead.company || "N/A"}`);
    lines.push(`Job Title: ${lead.jobTitle || "N/A"}`);
    lines.push(`Status: ${lead.status}`);
    lines.push(`Score: ${lead.score}/100 (${lead.priority} Priority)`);

    lines.push(`\n=== CHRONOLOGICAL ACTIVITY TIMELINE (${activities.length} events) ===`);
    if (activities.length === 0) {
      lines.push("No activities recorded yet.");
    } else {
      activities.forEach((act) => {
        const metaStr = act.metadata ? ` | Meta: ${JSON.stringify(act.metadata)}` : "";
        lines.push(`[${act.createdAt}] Event: ${act.type}${metaStr}`);
      });
    }

    lines.push(`\n=== CONVERSATION THREADS (${conversations.length} threads) ===`);
    if (conversations.length === 0) {
      lines.push("No active email conversations.");
    } else {
      conversations.forEach(({ thread, messages }, idx) => {
        lines.push(`\nThread #${idx + 1}: "${thread.subject}" [Status: ${thread.status}]`);
        messages.forEach((msg) => {
          lines.push(`  [${msg.sentAt}] ${msg.direction} (${msg.senderEmail} -> ${msg.recipientEmail}):`);
          lines.push(`  "${msg.bodyText.trim()}"`);
        });
      });
    }

    return lines.join("\n");
  }
}

export const leadContextBuilder = new LeadContextBuilder();
