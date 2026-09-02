export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface MockOrg {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface MockLead {
  id: string;
  organizationId: string;
  assignedToUserId: string;
  assignedToName: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  jobTitle: string;
  status:
    | "NEW"
    | "CONTACTED"
    | "REPLIED"
    | "QUALIFIED"
    | "PROPOSAL"
    | "WON"
    | "LOST"
    | "DORMANT";
  score: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  lastActivityAt: string;
  nextFollowupAt: string | null;
  customFields?: Record<string, string>;
  createdAt: string;
}

export interface MockActivity {
  id: string;
  organizationId: string;
  leadId: string;
  actorUserId?: string;
  actorName?: string;
  type:
    | "LEAD_CREATED"
    | "EMAIL_SENT"
    | "EMAIL_DELIVERED"
    | "EMAIL_OPENED"
    | "EMAIL_CLICKED"
    | "EMAIL_REPLIED"
    | "CALL_COMPLETED"
    | "NOTE_ADDED"
    | "PROPOSAL_SENT"
    | "PROPOSAL_VIEWED"
    | "FOLLOWUP_CREATED"
    | "FOLLOWUP_COMPLETED"
    | "STATUS_CHANGED";
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface MockMessage {
  id: string;
  conversationId: string;
  direction: "INBOUND" | "OUTBOUND";
  senderEmail: string;
  recipientEmail: string;
  bodyText: string;
  sentAt: string;
}

export interface MockConversation {
  id: string;
  organizationId: string;
  leadId: string;
  subject: string;
  messages: MockMessage[];
  createdAt: string;
}

export interface MockAiAnalysis {
  id: string;
  leadId: string;
  intent: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  signals: string[];
  recommendedAction:
    | "FOLLOW_UP_NOW"
    | "FOLLOW_UP_LATER"
    | "WAIT_FOR_RESPONSE"
    | "NURTURE"
    | "NO_ACTION"
    | "SCHEDULE_MEETING";
  reasoning: string;
  calculatedScore: number;
  createdAt: string;
}

export interface MockFollowup {
  id: string;
  organizationId: string;
  leadId: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  suggestedSubject: string;
  suggestedBody: string;
  reason: string;
  recommendedTiming: string;
  dueAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface MockUsage {
  period: string;
  leadsCount: number;
  leadsLimit: number;
  aiGenerationsCount: number;
  aiGenerationsLimit: number;
  emailsSentCount: number;
  emailsSentLimit: number;
  plan: "FREE" | "PRO" | "BUSINESS";
}

// Initial Mock Seed Data
export const INITIAL_USER: MockUser = {
  id: "usr_venkatesh_01",
  name: "Venkatesh",
  email: "venkatesh@followpilot.app",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const INITIAL_ORG: MockOrg = {
  id: "org_acme_corp_01",
  name: "Acme Sales Agency",
  slug: "acme-agency",
  role: "OWNER",
};

export const INITIAL_USAGE: MockUsage = {
  period: "2026-09",
  leadsCount: 128,
  leadsLimit: 2500,
  aiGenerationsCount: 142,
  aiGenerationsLimit: 1500,
  emailsSentCount: 890,
  emailsSentLimit: 5000,
  plan: "PRO",
};

export const INITIAL_LEADS: MockLead[] = [
  {
    id: "lead_john_acme",
    organizationId: "org_acme_corp_01",
    assignedToUserId: "usr_venkatesh_01",
    assignedToName: "Venkatesh",
    firstName: "John",
    lastName: "Smith",
    email: "john@acme.com",
    company: "Acme Technologies",
    phone: "+1 (555) 019-2834",
    jobTitle: "VP of Engineering",
    status: "REPLIED",
    score: 87,
    priority: "HIGH",
    lastActivityAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
    nextFollowupAt: new Date().toISOString(), // Today
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
  },
  {
    id: "lead_sarah_xyz",
    organizationId: "org_acme_corp_01",
    assignedToUserId: "usr_venkatesh_01",
    assignedToName: "Venkatesh",
    firstName: "Sarah",
    lastName: "Connor",
    email: "sarah@xyzsolutions.io",
    company: "XYZ Solutions",
    phone: "+1 (555) 014-9921",
    jobTitle: "Head of Product",
    status: "PROPOSAL",
    score: 82,
    priority: "HIGH",
    lastActivityAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
    nextFollowupAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
  },
  {
    id: "lead_rachel_apex",
    organizationId: "org_acme_corp_01",
    assignedToUserId: "usr_venkatesh_01",
    assignedToName: "Venkatesh",
    firstName: "Rachel",
    lastName: "Green",
    email: "rachel@apexglobal.org",
    company: "Apex Global",
    phone: "+1 (555) 018-7744",
    jobTitle: "VP Procurement",
    status: "REPLIED",
    score: 92,
    priority: "HIGH",
    lastActivityAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    nextFollowupAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
  },
  {
    id: "lead_marcus_nexus",
    organizationId: "org_acme_corp_01",
    assignedToUserId: "usr_venkatesh_01",
    assignedToName: "Venkatesh",
    firstName: "Marcus",
    lastName: "Vance",
    email: "marcus@nexusdynamics.com",
    company: "Nexus Dynamics",
    phone: "+1 (555) 017-3320",
    jobTitle: "Director Sales Ops",
    status: "QUALIFIED",
    score: 74,
    priority: "MEDIUM",
    lastActivityAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    nextFollowupAt: new Date(Date.now() + 86400 * 1000).toISOString(), // Tomorrow
    createdAt: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
  },
  {
    id: "lead_elena_starlight",
    organizationId: "org_acme_corp_01",
    assignedToUserId: "usr_venkatesh_01",
    assignedToName: "Venkatesh",
    firstName: "Elena",
    lastName: "Rostova",
    email: "elena@starlight.co",
    company: "Starlight Interactive",
    phone: "+1 (555) 012-4411",
    jobTitle: "Founder & CEO",
    status: "CONTACTED",
    score: 64,
    priority: "MEDIUM",
    lastActivityAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(), // 4 days ago
    nextFollowupAt: new Date().toISOString(), // Today (overdue)
    createdAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
  },
  {
    id: "lead_david_vortex",
    organizationId: "org_acme_corp_01",
    assignedToUserId: "usr_venkatesh_01",
    assignedToName: "Venkatesh",
    firstName: "David",
    lastName: "Kim",
    email: "david@vortex.dev",
    company: "Vortex Innovations",
    phone: "+1 (555) 011-8833",
    jobTitle: "CTO",
    status: "NEW",
    score: 42,
    priority: "LOW",
    lastActivityAt: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    nextFollowupAt: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
];

export const INITIAL_ACTIVITIES: Record<string, MockActivity[]> = {
  lead_john_acme: [
    {
      id: "act_101",
      organizationId: "org_acme_corp_01",
      leadId: "lead_john_acme",
      actorUserId: "usr_venkatesh_01",
      actorName: "Venkatesh",
      type: "LEAD_CREATED",
      createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    },
    {
      id: "act_102",
      organizationId: "org_acme_corp_01",
      leadId: "lead_john_acme",
      actorUserId: "usr_venkatesh_01",
      actorName: "Venkatesh",
      type: "EMAIL_SENT",
      metadata: { subject: "FollowPilot intro & workflow demo" },
      createdAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    },
    {
      id: "act_103",
      organizationId: "org_acme_corp_01",
      leadId: "lead_john_acme",
      type: "EMAIL_OPENED",
      createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    },
    {
      id: "act_104",
      organizationId: "org_acme_corp_01",
      leadId: "lead_john_acme",
      type: "EMAIL_CLICKED",
      metadata: { link: "/pricing" },
      createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    },
    {
      id: "act_105",
      organizationId: "org_acme_corp_01",
      leadId: "lead_john_acme",
      type: "EMAIL_REPLIED",
      metadata: { snippet: "Hi Venkatesh, could you send over pricing options for a 20-person sales team?" },
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "act_106",
      organizationId: "org_acme_corp_01",
      leadId: "lead_john_acme",
      type: "PROPOSAL_VIEWED",
      metadata: { viewDuration: "4m 12s" },
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
  ],
  lead_sarah_xyz: [
    {
      id: "act_201",
      organizationId: "org_acme_corp_01",
      leadId: "lead_sarah_xyz",
      actorUserId: "usr_venkatesh_01",
      type: "LEAD_CREATED",
      createdAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    },
    {
      id: "act_202",
      organizationId: "org_acme_corp_01",
      leadId: "lead_sarah_xyz",
      type: "PROPOSAL_SENT",
      metadata: { package: "Agency Pro Tier" },
      createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    },
    {
      id: "act_203",
      organizationId: "org_acme_corp_01",
      leadId: "lead_sarah_xyz",
      type: "PROPOSAL_VIEWED",
      metadata: { pagesViewed: 5 },
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ],
};

export const INITIAL_CONVERSATIONS: Record<string, MockConversation> = {
  lead_john_acme: {
    id: "conv_john_acme_1",
    organizationId: "org_acme_corp_01",
    leadId: "lead_john_acme",
    subject: "FollowPilot AI Follow-up Platform for Acme",
    createdAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    messages: [
      {
        id: "msg_1",
        conversationId: "conv_john_acme_1",
        direction: "OUTBOUND",
        senderEmail: "venkatesh@followpilot.app",
        recipientEmail: "john@acme.com",
        bodyText:
          "Hi John,\n\nI noticed Acme Technologies is expanding its sales team. FollowPilot helps engineering-focused B2B teams automate follow-up context and increase response rates by 3x.\n\nWould you be open to a 10-minute preview this week?\n\nBest regards,\nVenkatesh",
        sentAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
      },
      {
        id: "msg_2",
        conversationId: "conv_john_acme_1",
        direction: "INBOUND",
        senderEmail: "john@acme.com",
        recipientEmail: "venkatesh@followpilot.app",
        bodyText:
          "Hi Venkatesh,\n\nThanks for reaching out. We are actually evaluating options right now. Could you share details on pricing and security compliance for 20 seats?\n\nThanks,\nJohn Smith\nVP of Engineering",
        sentAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  lead_sarah_xyz: {
    id: "conv_sarah_xyz_1",
    organizationId: "org_acme_corp_01",
    leadId: "lead_sarah_xyz",
    subject: "XYZ Solutions Proposal & Rollout Plan",
    createdAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    messages: [
      {
        id: "msg_3",
        conversationId: "conv_sarah_xyz_1",
        direction: "OUTBOUND",
        senderEmail: "venkatesh@followpilot.app",
        recipientEmail: "sarah@xyzsolutions.io",
        bodyText:
          "Hi Sarah,\n\nAttached is the customized FollowPilot Agency Pro proposal we discussed. Let me know if you have any questions on the workflow triggers.\n\nBest,\nVenkatesh",
        sentAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
      },
    ],
  },
};

export const INITIAL_AI_ANALYSES: Record<string, MockAiAnalysis> = {
  lead_john_acme: {
    id: "ai_analysis_john",
    leadId: "lead_john_acme",
    intent: "HIGH",
    signals: [
      "Explicitly requested pricing & security compliance details",
      "Replied within 24 hours to cold outbound outreach",
      "Spent 4m 12s reviewing the proposal landing page",
      "Matches Target ICP (VP Engineering at growing B2B company)",
    ],
    recommendedAction: "FOLLOW_UP_NOW",
    reasoning:
      "John has expressed explicit buying intent by asking for team pricing and security compliance documentation. High likelihood of conversion if follow-up is delivered today.",
    calculatedScore: 87,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  lead_sarah_xyz: {
    id: "ai_analysis_sarah",
    leadId: "lead_sarah_xyz",
    intent: "HIGH",
    signals: [
      "Viewed custom proposal twice in 24 hours",
      "Reviewed 5 key pages in proposal portal",
      "Prior engagement with email attachments",
    ],
    recommendedAction: "FOLLOW_UP_NOW",
    reasoning:
      "Sarah has engaged heavily with the proposal document yesterday. A proactive follow-up to address contract terms or onboarding questions will lock in the deal.",
    calculatedScore: 82,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  lead_elena_starlight: {
    id: "ai_analysis_elena",
    leadId: "lead_elena_starlight",
    intent: "MEDIUM",
    signals: [
      "Opened initial email 4 days ago",
      "No response recorded for 96 hours",
      "High fit founder demographic",
    ],
    recommendedAction: "FOLLOW_UP_NOW",
    reasoning:
      "Elena opened the initial message but hasn't responded. A short, non-pushy follow-up offering a 2-minute video demo will re-engage her.",
    calculatedScore: 64,
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
};

export const INITIAL_FOLLOWUPS: MockFollowup[] = [
  {
    id: "fol_1",
    organizationId: "org_acme_corp_01",
    leadId: "lead_john_acme",
    status: "SCHEDULED",
    suggestedSubject: "FollowPilot pricing & SOC2 compliance overview for Acme",
    suggestedBody:
      "Hi John,\n\nFollowing up on your request regarding pricing for 20 seats and our security compliance.\n\nOur Pro Business tier covers 20 team seats at ₹5,999/mo (or custom enterprise SLA). I've attached our SOC2 Type II summary & security overview sheet.\n\nWould a quick 10-minute sync tomorrow at 2 PM work to answer any team questions?\n\nBest regards,\nVenkatesh",
    reason: "John asked for pricing and security info; immediate detailed response builds high trust.",
    recommendedTiming: "Today at 2:00 PM",
    dueAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "fol_2",
    organizationId: "org_acme_corp_01",
    leadId: "lead_sarah_xyz",
    status: "SCHEDULED",
    suggestedSubject: "Questions on the XYZ Solutions proposal?",
    suggestedBody:
      "Hi Sarah,\n\nI noticed you had a chance to review the Agency Pro proposal yesterday.\n\nDo you have any questions regarding the team workspace configuration or CSV import automation?\n\nGlad to jump on a quick call if that's helpful.\n\nBest,\nVenkatesh",
    reason: "Proposal viewed yesterday; prompt check-in overcomes quiet hesitation.",
    recommendedTiming: "Today at 4:00 PM",
    dueAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "fol_3",
    organizationId: "org_acme_corp_01",
    leadId: "lead_elena_starlight",
    status: "SCHEDULED",
    suggestedSubject: "Quick 2-min demo: AI sales follow-up engine for Starlight",
    suggestedBody:
      "Hi Elena,\n\nI know you're busy running Starlight Interactive. I recorded a 90-second loom showing how FollowPilot auto-prioritizes your top client follow-ups.\n\nWould you like me to send the link over?\n\nBest,\nVenkatesh",
    reason: "Re-engage dormant lead with low-friction 90-second video offer.",
    recommendedTiming: "Today at 5:30 PM",
    dueAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
];
