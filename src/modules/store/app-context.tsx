"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  MockLead,
  MockActivity,
  MockConversation,
  MockMessage,
  MockAiAnalysis,
  MockFollowup,
  MockUsage,
  MockUser,
  MockOrg,
  INITIAL_USER,
  INITIAL_ORG,
  INITIAL_USAGE,
  INITIAL_LEADS,
  INITIAL_ACTIVITIES,
  INITIAL_CONVERSATIONS,
  INITIAL_AI_ANALYSES,
  INITIAL_FOLLOWUPS,
} from "./mock-store";
import { calculateLeadScore } from "../scoring/score-engine";
import { analyzeLeadContext, generateFollowupDraft, GeneratedFollowupDraft } from "../ai/openai-client";
import { EntitlementService } from "../billing/entitlements";
import { sendEmailViaResend } from "../email/resend-client";
import { toast } from "sonner";

interface AppContextType {
  user: MockUser;
  org: MockOrg;
  usage: MockUsage;
  leads: MockLead[];
  activities: Record<string, MockActivity[]>;
  conversations: Record<string, MockConversation>;
  aiAnalyses: Record<string, MockAiAnalysis>;
  followups: MockFollowup[];
  // Actions
  addLead: (lead: Omit<MockLead, "id" | "score" | "priority" | "createdAt" | "lastActivityAt">) => boolean;
  bulkAddLeads: (newLeads: MockLead[]) => void;
  updateLeadStatus: (leadId: string, status: MockLead["status"]) => void;
  deleteLead: (leadId: string) => void;
  runAiAnalysis: (leadId: string) => Promise<MockAiAnalysis | null>;
  generateDraft: (leadId: string, notes?: string) => Promise<GeneratedFollowupDraft | null>;
  sendFollowupEmail: (leadId: string, followupId: string, subject: string, body: string) => Promise<boolean>;
  scheduleFollowup: (leadId: string, subject: string, body: string, timingStr: string) => void;
  addLeadNote: (leadId: string, noteText: string) => void;
  setActiveOrgId: (orgId: string) => void;
  resetToSeedData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<MockUser>(INITIAL_USER);
  const [org, setOrg] = useState<MockOrg>(INITIAL_ORG);

  const setActiveOrgId = (orgId: string) => {
    const mockNames: Record<string, string> = {
      org_demo_1: "Acme Corp (Demo)",
      org_demo_2: "FollowPilot Agency",
      org_demo_3: "Client Sales Team",
    };
    setOrg({
      id: orgId,
      name: mockNames[orgId] || "New Workspace",
      slug: orgId,
      role: "OWNER",
    });
    toast.info(`Switched to workspace "${mockNames[orgId] || orgId}"`);
  };
  const [usage, setUsage] = useState<MockUsage>(INITIAL_USAGE);
  const [leads, setLeads] = useState<MockLead[]>(INITIAL_LEADS);
  const [activities, setActivities] = useState<Record<string, MockActivity[]>>(INITIAL_ACTIVITIES);
  const [conversations, setConversations] = useState<Record<string, MockConversation>>(INITIAL_CONVERSATIONS);
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, MockAiAnalysis>>(INITIAL_AI_ANALYSES);
  const [followups, setFollowups] = useState<MockFollowup[]>(INITIAL_FOLLOWUPS);

  // Sync state to local storage for persistence across reloads
  useEffect(() => {
    const storedLeads = localStorage.getItem("followpilot_leads");
    if (storedLeads) {
      try {
        setLeads(JSON.parse(storedLeads));
      } catch (e) {}
    }
  }, []);

  const saveLeadsToStorage = (updatedLeads: MockLead[]) => {
    setLeads(updatedLeads);
    try {
      localStorage.setItem("followpilot_leads", JSON.stringify(updatedLeads));
    } catch (e) {}
  };

  // 1. Add Single Lead
  const addLead = (newLeadData: Omit<MockLead, "id" | "score" | "priority" | "createdAt" | "lastActivityAt">): boolean => {
    const gate = EntitlementService.canCreateLead(usage);
    if (!gate.allowed) {
      toast.error(gate.message || "Lead limit reached");
      return false;
    }

    const partial: Partial<MockLead> = {
      ...newLeadData,
      lastActivityAt: new Date().toISOString(),
    };
    const scoreBreakdown = calculateLeadScore(partial, [], "UNKNOWN");

    const newLead: MockLead = {
      ...newLeadData,
      id: `lead_${Date.now()}`,
      score: scoreBreakdown.score,
      priority: scoreBreakdown.priority,
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newLead, ...leads];
    saveLeadsToStorage(updated);

    // Record Activity
    const newAct: MockActivity = {
      id: `act_${Date.now()}`,
      organizationId: org.id,
      leadId: newLead.id,
      actorUserId: user.id,
      actorName: user.name,
      type: "LEAD_CREATED",
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => ({
      ...prev,
      [newLead.id]: [newAct],
    }));

    // Increment Usage
    setUsage((prev) => ({ ...prev, leadsCount: prev.leadsCount + 1 }));
    toast.success(`Lead "${newLead.firstName} ${newLead.lastName}" created`);
    return true;
  };

  // 2. Bulk Add Leads (CSV)
  const bulkAddLeads = (newLeads: MockLead[]) => {
    const updated = [...newLeads, ...leads];
    saveLeadsToStorage(updated);
    setUsage((prev) => ({ ...prev, leadsCount: prev.leadsCount + newLeads.length }));

    // Create activity logs for bulk import
    const newActsMap = { ...activities };
    newLeads.forEach((l) => {
      newActsMap[l.id] = [
        {
          id: `act_imp_${Date.now()}_${l.id}`,
          organizationId: org.id,
          leadId: l.id,
          actorUserId: user.id,
          actorName: user.name,
          type: "LEAD_CREATED",
          metadata: { source: "CSV Import" },
          createdAt: new Date().toISOString(),
        },
      ];
    });
    setActivities(newActsMap);
  };

  // 3. Update Lead Status
  const updateLeadStatus = (leadId: string, status: MockLead["status"]) => {
    const target = leads.find((l) => l.id === leadId);
    if (!target) return;

    const oldStatus = target.status;
    const updatedLeads = leads.map((l) => {
      if (l.id === leadId) {
        const partial = { ...l, status, lastActivityAt: new Date().toISOString() };
        const leadActs = activities[leadId] || [];
        const aiAnalysis = aiAnalyses[leadId];
        const scoreBreakdown = calculateLeadScore(partial, leadActs, aiAnalysis?.intent || "UNKNOWN");
        return {
          ...l,
          status,
          score: scoreBreakdown.score,
          priority: scoreBreakdown.priority,
          lastActivityAt: new Date().toISOString(),
        };
      }
      return l;
    });

    saveLeadsToStorage(updatedLeads);

    // Record Status Changed Activity
    const act: MockActivity = {
      id: `act_status_${Date.now()}`,
      organizationId: org.id,
      leadId,
      actorUserId: user.id,
      actorName: user.name,
      type: "STATUS_CHANGED",
      metadata: { from: oldStatus, to: status },
      createdAt: new Date().toISOString(),
    };

    setActivities((prev) => ({
      ...prev,
      [leadId]: [act, ...(prev[leadId] || [])],
    }));

    toast.info(`Status updated to ${status}`);
  };

  // 4. Delete Lead
  const deleteLead = (leadId: string) => {
    const updated = leads.filter((l) => l.id !== leadId);
    saveLeadsToStorage(updated);
    toast.success("Lead deleted");
  };

  // 5. Run AI Analysis
  const runAiAnalysis = async (leadId: string): Promise<MockAiAnalysis | null> => {
    const gate = EntitlementService.canGenerateAI(usage);
    if (!gate.allowed) {
      toast.error(gate.message || "AI limit reached");
      return null;
    }

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const leadActs = activities[leadId] || [];
    const conv = conversations[leadId];

    const analysis = await analyzeLeadContext(lead, leadActs, conv);

    setAiAnalyses((prev) => ({ ...prev, [leadId]: analysis }));
    setUsage((prev) => ({ ...prev, aiGenerationsCount: prev.aiGenerationsCount + 1 }));

    // Recalculate lead score with new AI intent
    const scoreBreakdown = calculateLeadScore(lead, leadActs, analysis.intent);
    const updatedLeads = leads.map((l) =>
      l.id === leadId
        ? {
            ...l,
            score: scoreBreakdown.score,
            priority: scoreBreakdown.priority,
          }
        : l
    );
    saveLeadsToStorage(updatedLeads);

    toast.success("AI Intelligence analysis complete");
    return analysis;
  };

  // 6. Generate Draft
  const generateDraft = async (leadId: string, notes?: string): Promise<GeneratedFollowupDraft | null> => {
    const gate = EntitlementService.canGenerateAI(usage);
    if (!gate.allowed) {
      toast.error(gate.message || "AI limit reached");
      return null;
    }

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const analysis = aiAnalyses[leadId] || (await runAiAnalysis(leadId));
    if (!analysis) return null;

    const conv = conversations[leadId];
    const draft = await generateFollowupDraft(lead, analysis, conv, notes);

    setUsage((prev) => ({ ...prev, aiGenerationsCount: prev.aiGenerationsCount + 1 }));
    return draft;
  };

  // 7. Send Follow-up Email
  const sendFollowupEmail = async (
    leadId: string,
    followupId: string,
    subject: string,
    body: string
  ): Promise<boolean> => {
    const gate = EntitlementService.canSendEmail(usage);
    if (!gate.allowed) {
      toast.error(gate.message || "Email send quota reached");
      return false;
    }

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return false;

    const idempotencyKey = `org_${org.id}_lead_${lead.id}_fol_${Date.now()}`;
    const result = await sendEmailViaResend({
      to: lead.email,
      subject,
      bodyHtml: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
      idempotencyKey,
    });

    if (!result.success) {
      toast.error(result.error || "Email delivery failed");
      return false;
    }

    // 1. Mark Follow-up completed
    setFollowups((prev) =>
      prev.map((f) => (f.id === followupId ? { ...f, status: "COMPLETED", completedAt: new Date().toISOString() } : f))
    );

    // 2. Add Outbound Message to Conversation
    const newMsg: MockMessage = {
      id: `msg_${Date.now()}`,
      conversationId: conversations[leadId]?.id || `conv_${leadId}`,
      direction: "OUTBOUND",
      senderEmail: user.email,
      recipientEmail: lead.email,
      bodyText: body,
      sentAt: new Date().toISOString(),
    };

    setConversations((prev) => {
      const existing = prev[leadId] || {
        id: `conv_${leadId}`,
        organizationId: org.id,
        leadId,
        subject,
        messages: [],
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        [leadId]: {
          ...existing,
          messages: [...existing.messages, newMsg],
        },
      };
    });

    // 3. Record Activity
    const act: MockActivity = {
      id: `act_sent_${Date.now()}`,
      organizationId: org.id,
      leadId,
      actorUserId: user.id,
      actorName: user.name,
      type: "EMAIL_SENT",
      metadata: { subject, resendMessageId: result.messageId },
      createdAt: new Date().toISOString(),
    };

    setActivities((prev) => ({
      ...prev,
      [leadId]: [act, ...(prev[leadId] || [])],
    }));

    // 4. Update Lead status to CONTACTED (if NEW) & recalculate score
    const updatedLeads = leads.map((l) => {
      if (l.id === leadId) {
        const nextStatus = l.status === "NEW" ? "CONTACTED" : l.status;
        const leadActs = [act, ...(activities[leadId] || [])];
        const aiIntent = aiAnalyses[leadId]?.intent || "UNKNOWN";
        const scoreBreakdown = calculateLeadScore({ ...l, status: nextStatus }, leadActs, aiIntent);
        return {
          ...l,
          status: nextStatus,
          score: scoreBreakdown.score,
          priority: scoreBreakdown.priority,
          lastActivityAt: new Date().toISOString(),
          nextFollowupAt: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
        };
      }
      return l;
    });

    saveLeadsToStorage(updatedLeads);
    setUsage((prev) => ({ ...prev, emailsSentCount: prev.emailsSentCount + 1 }));

    toast.success(`Follow-up email sent to ${lead.email}`);
    return true;
  };

  // 8. Schedule Follow-up
  const scheduleFollowup = (leadId: string, subject: string, body: string, timingStr: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const newFol: MockFollowup = {
      id: `fol_${Date.now()}`,
      organizationId: org.id,
      leadId,
      status: "SCHEDULED",
      suggestedSubject: subject,
      suggestedBody: body,
      reason: "Manual follow-up scheduled by user",
      recommendedTiming: timingStr,
      dueAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    setFollowups((prev) => [newFol, ...prev]);

    // Update lead next follow-up date
    const updatedLeads = leads.map((l) =>
      l.id === leadId
        ? {
            ...l,
            nextFollowupAt: newFol.dueAt,
          }
        : l
    );
    saveLeadsToStorage(updatedLeads);

    toast.success(`Follow-up scheduled for ${lead.firstName} ${lead.lastName}`);
  };

  // 9. Add Lead Note
  const addLeadNote = (leadId: string, noteText: string) => {
    const act: MockActivity = {
      id: `act_note_${Date.now()}`,
      organizationId: org.id,
      leadId,
      actorUserId: user.id,
      actorName: user.name,
      type: "NOTE_ADDED",
      metadata: { note: noteText },
      createdAt: new Date().toISOString(),
    };

    setActivities((prev) => ({
      ...prev,
      [leadId]: [act, ...(prev[leadId] || [])],
    }));

    toast.success("Note added to timeline");
  };

  // 10. Reset Seed Data
  const resetToSeedData = () => {
    localStorage.removeItem("followpilot_leads");
    setLeads(INITIAL_LEADS);
    setActivities(INITIAL_ACTIVITIES);
    setConversations(INITIAL_CONVERSATIONS);
    setAiAnalyses(INITIAL_AI_ANALYSES);
    setFollowups(INITIAL_FOLLOWUPS);
    setUsage(INITIAL_USAGE);
    toast.info("Database reset to demo seed data");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        org,
        usage,
        leads,
        activities,
        conversations,
        aiAnalyses,
        followups,
        addLead,
        bulkAddLeads,
        updateLeadStatus,
        deleteLead,
        runAiAnalysis,
        generateDraft,
        sendFollowupEmail,
        scheduleFollowup,
        addLeadNote,
        setActiveOrgId,
        resetToSeedData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    // Return safe fallback for static build time prerendering
    return {
      user: INITIAL_USER,
      org: INITIAL_ORG,
      usage: INITIAL_USAGE,
      leads: [],
      activities: {},
      conversations: {},
      aiAnalyses: {},
      followups: [],
      organizations: [],
      activeOrgId: "",
      setActiveOrgId: () => {},
      addLead: () => false,
      bulkAddLeads: () => {},
      updateLeadStatus: () => {},
      deleteLead: () => {},
      runAiAnalysis: async () => null,
      generateDraft: async () => null,
      sendFollowupEmail: async () => false,
      completeFollowup: () => {},
      addActivity: () => {},
      scheduleFollowup: () => {},
      addLeadNote: () => {},
      addOrganization: () => {},
      resetToSeedData: () => {},
    } as unknown as AppContextType;
  }
  return context;
}
