ALTER TABLE "ai_analyses" ALTER COLUMN "model" SET DEFAULT 'gpt-4o-mini-2024-07-18';--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "analysis_source" text DEFAULT 'AI' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "human_override_action" text;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "override_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "override_at" timestamp;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD COLUMN "override_reason" text;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_override_by_user_id_users_id_fk" FOREIGN KEY ("override_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;