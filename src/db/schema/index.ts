import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  index,
  uniqueIndex,
  boolean,
  real,
} from "drizzle-orm/pg-core";

// 1. Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Organizations Table
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("org_slug_idx").on(table.slug)]
);

// 3. Memberships Table (RBAC)
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["OWNER", "ADMIN", "MEMBER", "VIEWER"] })
      .default("MEMBER")
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    index("membership_org_idx").on(table.organizationId),
    index("membership_user_idx").on(table.userId),
    uniqueIndex("membership_org_user_idx").on(table.organizationId, table.userId),
  ]
);

// 4. Leads Table
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    phone: text("phone"),
    jobTitle: text("job_title"),
    status: text("status", {
      enum: [
        "NEW",
        "CONTACTED",
        "REPLIED",
        "QUALIFIED",
        "PROPOSAL",
        "WON",
        "LOST",
        "DORMANT",
      ],
    })
      .default("NEW")
      .notNull(),
    score: integer("score").default(50).notNull(),
    priority: text("priority", { enum: ["HIGH", "MEDIUM", "LOW"] })
      .default("MEDIUM")
      .notNull(),
    lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
    nextFollowupAt: timestamp("next_followup_at"),
    customFields: jsonb("custom_fields").$type<Record<string, string>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("lead_org_idx").on(table.organizationId),
    index("lead_org_status_idx").on(table.organizationId, table.status),
    index("lead_org_score_idx").on(table.organizationId, table.score),
    index("lead_org_next_followup_idx").on(
      table.organizationId,
      table.nextFollowupAt
    ),
    index("lead_org_email_idx").on(table.organizationId, table.email),
    uniqueIndex("lead_org_email_unique_idx").on(table.organizationId, table.email),
  ]
);

// 5. Lead Activities Table
export const leadActivities = pgTable(
  "lead_activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    type: text("type", {
      enum: [
        "LEAD_CREATED",
        "EMAIL_SENT",
        "EMAIL_DELIVERED",
        "EMAIL_OPENED",
        "EMAIL_CLICKED",
        "EMAIL_REPLIED",
        "CALL_COMPLETED",
        "NOTE_ADDED",
        "PROPOSAL_SENT",
        "PROPOSAL_VIEWED",
        "FOLLOWUP_CREATED",
        "FOLLOWUP_COMPLETED",
        "STATUS_CHANGED",
      ],
    }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("activity_lead_idx").on(table.leadId, table.createdAt),
    index("activity_org_idx").on(table.organizationId, table.createdAt),
  ]
);

// 6. Conversations Table
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    status: text("status", { enum: ["OPEN", "CLOSED", "ARCHIVED"] })
      .default("OPEN")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("conv_lead_idx").on(table.leadId),
    index("conv_org_lead_idx").on(table.organizationId, table.leadId),
  ]
);

// 7. Messages Table
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    direction: text("direction", { enum: ["INBOUND", "OUTBOUND"] }).notNull(),
    senderEmail: text("sender_email").notNull(),
    recipientEmail: text("recipient_email").notNull(),
    bodyText: text("body_text").notNull(),
    bodyHtml: text("body_html"),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => [index("msg_conv_idx").on(table.conversationId, table.sentAt)]
);

// 8. AI Analyses Table
export const aiAnalyses = pgTable(
  "ai_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "STALE"],
    })
      .default("COMPLETED")
      .notNull(),
    intent: text("intent", { enum: ["HIGH", "MEDIUM", "LOW", "UNKNOWN"] })
      .default("UNKNOWN")
      .notNull(),
    intentConfidence: real("intent_confidence").default(0.8).notNull(),
    sentiment: text("sentiment", {
      enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED", "UNKNOWN"],
    })
      .default("NEUTRAL")
      .notNull(),
    sentimentConfidence: real("sentiment_confidence").default(0.8).notNull(),
    urgency: text("urgency", { enum: ["HIGH", "MEDIUM", "LOW"] })
      .default("MEDIUM")
      .notNull(),
    signals: jsonb("signals").$type<string[]>().default([]).notNull(),
    evidence: jsonb("evidence")
      .$type<
        {
          type: string;
          description: string;
          sourceType?: "ACTIVITY" | "MESSAGE" | "LEAD_FIELD" | "HEURISTIC";
          sourceId?: string;
          timestamp?: string;
        }[]
      >()
      .default([])
      .notNull(),
    recommendedAction: text("recommended_action", {
      enum: [
        "FOLLOW_UP_NOW",
        "FOLLOW_UP_LATER",
        "WAIT_FOR_RESPONSE",
        "NURTURE",
        "NO_ACTION",
        "SCHEDULE_MEETING",
      ],
    })
      .default("NO_ACTION")
      .notNull(),
    recommendedDelayHours: integer("recommended_delay_hours").default(24),
    reasoning: text("reasoning").notNull(),
    risks: jsonb("risks").$type<string[]>().default([]).notNull(),
    calculatedScore: integer("calculated_score").notNull(),
    scoreSnapshot: integer("score_snapshot").default(50).notNull(),
    contextFingerprint: text("context_fingerprint"),
    promptVersion: text("prompt_version").default("v1.0.0-lead-intent").notNull(),
    model: text("model").default("gpt-4o-mini-2024-07-18").notNull(),
    modelVersion: text("model_version"),
    inputTokens: integer("input_tokens").default(0).notNull(),
    outputTokens: integer("output_tokens").default(0).notNull(),
    totalTokens: integer("total_tokens").default(0).notNull(),
    estimatedCost: text("estimated_cost").default("0.0000").notNull(),
    isFallback: boolean("is_fallback").default(false).notNull(),
    analysisSource: text("analysis_source", {
      enum: ["AI", "DETERMINISTIC_FALLBACK"],
    })
      .default("AI")
      .notNull(),
    humanOverrideAction: text("human_override_action", {
      enum: [
        "FOLLOW_UP_NOW",
        "FOLLOW_UP_LATER",
        "WAIT_FOR_RESPONSE",
        "NURTURE",
        "NO_ACTION",
        "SCHEDULE_MEETING",
      ],
    }),
    overrideByUserId: uuid("override_by_user_id").references(() => users.id),
    overrideAt: timestamp("override_at"),
    overrideReason: text("override_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("ai_lead_idx").on(table.leadId, table.createdAt),
    index("ai_org_lead_status_idx").on(
      table.organizationId,
      table.leadId,
      table.status
    ),
    index("ai_org_created_idx").on(table.organizationId, table.createdAt),
  ]
);

// 9. Followups Table
export const followups = pgTable(
  "followups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    status: text("status", { enum: ["SCHEDULED", "COMPLETED", "CANCELLED"] })
      .default("SCHEDULED")
      .notNull(),
    suggestedSubject: text("suggested_subject").notNull(),
    suggestedBody: text("suggested_body").notNull(),
    reason: text("reason"),
    recommendedTiming: text("recommended_timing"),
    dueAt: timestamp("due_at").notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("followup_org_status_idx").on(
      table.organizationId,
      table.status,
      table.dueAt
    ),
    index("followup_lead_idx").on(table.leadId),
  ]
);

// 10. Emails Table
export const emails = pgTable(
  "emails",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    followupId: uuid("followup_id").references(() => followups.id),
    resendMessageId: text("resend_message_id").unique(),
    subject: text("subject").notNull(),
    bodyHtml: text("body_html").notNull(),
    status: text("status", {
      enum: ["QUEUED", "SENT", "DELIVERED", "BOUNCED", "FAILED"],
    })
      .default("QUEUED")
      .notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => [index("email_org_idx").on(table.organizationId, table.sentAt)]
);

// 11. Email Events Table
export const emailEvents = pgTable("email_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  emailId: uuid("email_id")
    .notNull()
    .references(() => emails.id, { onDelete: "cascade" }),
  eventType: text("event_type", {
    enum: ["DELIVERED", "OPENED", "CLICKED", "BOUNCED", "REPLIED"],
  }).notNull(),
  payload: jsonb("payload").$type<Record<string, any>>(),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

// 12. Subscriptions Table
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    plan: text("plan", { enum: ["FREE", "PRO", "BUSINESS"] })
      .default("FREE")
      .notNull(),
    status: text("status", {
      enum: ["ACTIVE", "CANCELED", "PAST_DUE", "TRIALING"],
    })
      .default("ACTIVE")
      .notNull(),
    currentPeriodEnd: timestamp("current_period_end"),
  },
  (table) => [index("sub_org_idx").on(table.organizationId)]
);

// 13. Usage Records Table
export const usageRecords = pgTable(
  "usage_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    period: text("period").notNull(), // e.g. "2026-09"
    leadsCount: integer("leads_count").default(0).notNull(),
    aiGenerationsCount: integer("ai_generations_count").default(0).notNull(),
    emailsSentCount: integer("emails_sent_count").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("usage_org_period_idx").on(table.organizationId, table.period),
  ]
);

// 14. Organization Invitations Table
export const organizationInvitations = pgTable(
  "organization_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role", { enum: ["OWNER", "ADMIN", "MEMBER", "VIEWER"] })
      .default("MEMBER")
      .notNull(),
    token: text("token").notNull().unique(),
    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"] })
      .default("PENDING")
      .notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("invitation_org_idx").on(table.organizationId),
    index("invitation_token_idx").on(table.token),
  ]
);

