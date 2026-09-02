export interface AnalyticsProperties {
  organizationId?: string;
  leadId?: string;
  score?: number;
  plan?: string;
  [key: string]: any;
}

class AnalyticsService {
  private isEnabled(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
  }

  track(eventName: string, properties?: AnalyticsProperties) {
    if (!this.isEnabled()) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics Track Stub] ${eventName}`, properties || {});
      }
      return;
    }

    try {
      // PostHog or telemetry client dispatch boundary
      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture(eventName, properties);
      }
    } catch (err) {
      console.warn("Analytics capture failed:", err);
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!this.isEnabled()) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics Identify Stub] User: ${userId}`, traits || {});
      }
      return;
    }

    try {
      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.identify(userId, traits);
      }
    } catch (err) {
      console.warn("Analytics identify failed:", err);
    }
  }
}

export const analytics = new AnalyticsService();
