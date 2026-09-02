import { Resend } from "resend";

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY || "re_dummy_key_for_followpilot_dev";
  return new Resend(apiKey);
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  idempotencyKey?: string;
}

export interface SendEmailResult {
  id: string;
  status: "SENT" | "QUEUED";
}
