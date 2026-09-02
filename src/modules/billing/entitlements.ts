import { MockUsage } from "../store/mock-store";

export interface PlanLimits {
  leads: number;
  aiGenerations: number;
  emailsSent: number;
  maxMembers: number;
}

export const PLAN_CONFIG: Record<"FREE" | "PRO" | "BUSINESS", PlanLimits> = {
  FREE: {
    leads: 50,
    aiGenerations: 20,
    emailsSent: 100,
    maxMembers: 1,
  },
  PRO: {
    leads: 2500,
    aiGenerations: 1500,
    emailsSent: 5000,
    maxMembers: 1,
  },
  BUSINESS: {
    leads: 10000,
    aiGenerations: 5000,
    emailsSent: 25000,
    maxMembers: 9999,
  },
};

export class EntitlementService {
  static canCreateLead(usage: MockUsage): { allowed: boolean; message?: string } {
    const limit = PLAN_CONFIG[usage.plan].leads;
    if (usage.leadsCount >= limit) {
      return {
        allowed: false,
        message: `Plan limit reached (${usage.leadsCount}/${limit} leads). Upgrade to PRO or BUSINESS for higher quotas.`,
      };
    }
    return { allowed: true };
  }

  static canGenerateAI(usage: MockUsage): { allowed: boolean; message?: string } {
    const limit = PLAN_CONFIG[usage.plan].aiGenerations;
    if (usage.aiGenerationsCount >= limit) {
      return {
        allowed: false,
        message: `AI generation limit reached (${usage.aiGenerationsCount}/${limit} runs). Upgrade your plan to generate more follow-ups.`,
      };
    }
    return { allowed: true };
  }

  static canSendEmail(usage: MockUsage): { allowed: boolean; message?: string } {
    const limit = PLAN_CONFIG[usage.plan].emailsSent;
    if (usage.emailsSentCount >= limit) {
      return {
        allowed: false,
        message: `Email sending quota reached (${usage.emailsSentCount}/${limit} sent). Upgrade your subscription to increase email capacity.`,
      };
    }
    return { allowed: true };
  }

  static canInviteMember(usage: MockUsage, currentMemberCount: number): { allowed: boolean; message?: string } {
    const limit = PLAN_CONFIG[usage.plan].maxMembers;
    if (currentMemberCount >= limit) {
      return {
        allowed: false,
        message: `Member invitation limit reached for ${usage.plan} tier. Upgrade to BUSINESS to invite unlimited team members.`,
      };
    }
    return { allowed: true };
  }
}
