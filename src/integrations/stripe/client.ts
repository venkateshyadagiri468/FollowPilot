import Stripe from "stripe";

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_followpilot_dev";
  return new Stripe(secretKey, {
    apiVersion: "2026-01-28" as any,
  });
}

export interface StripeCheckoutParams {
  organizationId: string;
  plan: "PRO" | "BUSINESS";
  successUrl: string;
  cancelUrl: string;
}
