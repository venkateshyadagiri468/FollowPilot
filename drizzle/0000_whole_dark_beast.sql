CREATE TABLE "ai_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"status" text DEFAULT 'COMPLETED' NOT NULL,
	"intent" text DEFAULT 'UNKNOWN' NOT NULL,
	"intent_confidence" real DEFAULT 0.8 NOT NULL,
	"sentiment" text DEFAULT 'NEUTRAL' NOT NULL,
	"sentiment_confidence" real DEFAULT 0.8 NOT NULL,
	"urgency" text DEFAULT 'MEDIUM' NOT NULL,
	"signals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommended_action" text DEFAULT 'NO_ACTION' NOT NULL,
	"recommended_delay_hours" integer DEFAULT 24,
	"reasoning" text NOT NULL,
	"risks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"calculated_score" integer NOT NULL,
	"score_snapshot" integer DEFAULT 50 NOT NULL,
	"context_fingerprint" text,
	"prompt_version" text DEFAULT 'v1.0.0-lead-intent' NOT NULL,
	"model" text DEFAULT 'gpt-4o-mini' NOT NULL,
	"model_version" text,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost" text DEFAULT '0.0000' NOT NULL,
	"is_fallback" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"followup_id" uuid,
	"resend_message_id" text,
	"subject" text NOT NULL,
	"body_html" text NOT NULL,
	"status" text DEFAULT 'QUEUED' NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "emails_resend_message_id_unique" UNIQUE("resend_message_id")
);
--> statement-breakpoint
CREATE TABLE "followups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"created_by_user_id" uuid,
	"status" text DEFAULT 'SCHEDULED' NOT NULL,
	"suggested_subject" text NOT NULL,
	"suggested_body" text NOT NULL,
	"reason" text,
	"recommended_timing" text,
	"due_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"type" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"assigned_to_user_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"phone" text,
	"job_title" text,
	"status" text DEFAULT 'NEW' NOT NULL,
	"score" integer DEFAULT 50 NOT NULL,
	"priority" text DEFAULT 'MEDIUM' NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"next_followup_at" timestamp,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"direction" text NOT NULL,
	"sender_email" text NOT NULL,
	"recipient_email" text NOT NULL,
	"body_text" text NOT NULL,
	"body_html" text,
	"metadata" jsonb,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"token" text NOT NULL,
	"invited_by_user_id" uuid NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"plan" text DEFAULT 'FREE' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"current_period_end" timestamp,
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"period" text NOT NULL,
	"leads_count" integer DEFAULT 0 NOT NULL,
	"ai_generations_count" integer DEFAULT 0 NOT NULL,
	"emails_sent_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_followup_id_followups_id_fk" FOREIGN KEY ("followup_id") REFERENCES "public"."followups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followups" ADD CONSTRAINT "followups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followups" ADD CONSTRAINT "followups_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followups" ADD CONSTRAINT "followups_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_lead_idx" ON "ai_analyses" USING btree ("lead_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_org_lead_status_idx" ON "ai_analyses" USING btree ("organization_id","lead_id","status");--> statement-breakpoint
CREATE INDEX "ai_org_created_idx" ON "ai_analyses" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "conv_lead_idx" ON "conversations" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "conv_org_lead_idx" ON "conversations" USING btree ("organization_id","lead_id");--> statement-breakpoint
CREATE INDEX "email_org_idx" ON "emails" USING btree ("organization_id","sent_at");--> statement-breakpoint
CREATE INDEX "followup_org_status_idx" ON "followups" USING btree ("organization_id","status","due_at");--> statement-breakpoint
CREATE INDEX "followup_lead_idx" ON "followups" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "activity_lead_idx" ON "lead_activities" USING btree ("lead_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_org_idx" ON "lead_activities" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "lead_org_idx" ON "leads" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "lead_org_status_idx" ON "leads" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "lead_org_score_idx" ON "leads" USING btree ("organization_id","score");--> statement-breakpoint
CREATE INDEX "lead_org_next_followup_idx" ON "leads" USING btree ("organization_id","next_followup_at");--> statement-breakpoint
CREATE INDEX "lead_org_email_idx" ON "leads" USING btree ("organization_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "lead_org_email_unique_idx" ON "leads" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "membership_org_idx" ON "memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "membership_user_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_org_user_idx" ON "memberships" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "msg_conv_idx" ON "messages" USING btree ("conversation_id","sent_at");--> statement-breakpoint
CREATE INDEX "invitation_org_idx" ON "organization_invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_token_idx" ON "organization_invitations" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "org_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sub_org_idx" ON "subscriptions" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_org_period_idx" ON "usage_records" USING btree ("organization_id","period");