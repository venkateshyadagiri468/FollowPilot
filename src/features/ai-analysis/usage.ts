import { AIQuotaExceededError } from "./errors";

export const TIER_QUOTAS: Record<string, number> = {
  FREE: 50,
  PRO: 1000,
  BUSINESS: 10000,
};

// In-memory usage counter store for local dev & testing
const monthlyUsageStore = new Map<string, number>();

export function getPeriodKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export class AIUsageTracker {
  async checkEntitlement(orgId: string, plan: "FREE" | "PRO" | "BUSINESS" = "FREE"): Promise<void> {
    const period = getPeriodKey();
    const storeKey = `${orgId}:${period}`;
    const currentUsage = monthlyUsageStore.get(storeKey) || 0;
    const limit = TIER_QUOTAS[plan] || TIER_QUOTAS.FREE;

    if (currentUsage >= limit) {
      throw new AIQuotaExceededError(
        `Organization has reached monthly AI analysis limit (${currentUsage}/${limit}) for plan '${plan}'. Upgrade to PRO or BUSINESS for higher limits.`
      );
    }
  }

  async recordUsage(orgId: string, tokensUsed: number): Promise<number> {
    const period = getPeriodKey();
    const storeKey = `${orgId}:${period}`;
    const currentUsage = monthlyUsageStore.get(storeKey) || 0;
    const newUsage = currentUsage + 1;
    monthlyUsageStore.set(storeKey, newUsage);
    return newUsage;
  }

  async getUsage(orgId: string): Promise<number> {
    const period = getPeriodKey();
    const storeKey = `${orgId}:${period}`;
    return monthlyUsageStore.get(storeKey) || 0;
  }
}

export const aiUsageTracker = new AIUsageTracker();
