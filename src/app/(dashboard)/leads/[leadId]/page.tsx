"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/modules/store/app-context";
import { ScorePill } from "@/components/domain/ScorePill";
import { LeadStatusBadge } from "@/components/domain/LeadStatusBadge";
import { ActivityTimeline } from "@/components/domain/ActivityTimeline";
import { FollowupGeneratorModal } from "@/components/domain/FollowupGeneratorModal";
import { MockLead } from "@/modules/store/mock-store";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  RefreshCw,
  Send,
  MessageSquare,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.leadId as string;

  const {
    leads,
    activities,
    conversations,
    aiAnalyses,
    updateLeadStatus,
    deleteLead,
    runAiAnalysis,
  } = useApp();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const lead = leads.find((l) => l.id === leadId);
  if (!lead) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Lead not found</h2>
        <Link href="/leads" className="text-xs font-semibold text-indigo-600 hover:underline">
          ← Return to Lead Table
        </Link>
      </div>
    );
  }

  const leadActivities = activities[leadId] || [];
  const conv = conversations[leadId];
  const aiAnalysis = aiAnalyses[leadId];

  const handleRunAi = async () => {
    setIsAnalyzing(true);
    await runAiAnalysis(lead.id);
    setIsAnalyzing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete lead ${lead.firstName} ${lead.lastName}?`)) {
      deleteLead(lead.id);
      router.push("/leads");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <div className="space-y-1.5">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to leads</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {lead.firstName} {lead.lastName}
            </h1>
            <ScorePill score={lead.score} priority={lead.priority} />
            <LeadStatusBadge status={lead.status} />
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-2">
            <span>{lead.jobTitle} at <strong className="text-slate-700 dark:text-slate-300">{lead.company}</strong></span>
            <span>•</span>
            <span>Assigned to <strong className="text-slate-700 dark:text-slate-300">{lead.assignedToName}</strong></span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={lead.status}
            onChange={(e) => updateLeadStatus(lead.id, e.target.value as MockLead["status"])}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="REPLIED">REPLIED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="PROPOSAL">PROPOSAL</option>
            <option value="WON">WON</option>
            <option value="LOST">LOST</option>
            <option value="DORMANT">DORMANT</option>
          </select>

          <button
            onClick={() => setIsCopilotOpen(true)}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Follow-up</span>
          </button>

          <button
            onClick={handleDelete}
            title="Delete Lead"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Workspace Column (2 Spans): Contact Meta + Conversation History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Contact & Account Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-slate-400 text-[10px]">Email</span>
                  <a href={`mailto:${lead.email}`} className="font-medium text-indigo-600 hover:underline">
                    {lead.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-slate-400 text-[10px]">Phone</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {lead.phone || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-slate-400 text-[10px]">Company</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {lead.company}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Thread History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Threaded Conversation ({conv?.messages.length || 0} messages)
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {!conv || conv.messages.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <p>No conversation history recorded for this lead yet.</p>
                  <button
                    onClick={() => setIsCopilotOpen(true)}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    + Send initial outbound email
                  </button>
                </div>
              ) : (
                conv.messages.map((msg) => {
                  const isOutbound = msg.direction === "OUTBOUND";
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl border ${
                        isOutbound
                          ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 ml-6"
                          : "bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-semibold text-xs ${
                            isOutbound ? "text-slate-800 dark:text-slate-200" : "text-indigo-900 dark:text-indigo-200"
                          }`}
                        >
                          {isOutbound ? "Sales Team (Outbound)" : `${lead.firstName} ${lead.lastName} (Inbound)`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.sentAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                        {msg.bodyText}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Timeline Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
            <ActivityTimeline leadId={lead.id} activities={leadActivities} />
          </div>
        </div>

        {/* Right Workspace Column: AI Intelligence & Scoring Breakdown */}
        <div className="space-y-6">
          {/* AI Intelligence Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  AI Intelligence & Intent
                </h3>
              </div>

              <button
                onClick={handleRunAi}
                disabled={isAnalyzing}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`} />
                <span>Re-analyze</span>
              </button>
            </div>

            {aiAnalysis ? (
              <div className="space-y-4 text-xs">
                {/* Intent & Action Recommendation */}
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Buyer Intent</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      {aiAnalysis.intent} INTENT
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Recommended Action</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {aiAnalysis.recommendedAction.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Reasoning Paragraph */}
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    AI Context Summary
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/60">
                    {aiAnalysis.reasoning}
                  </p>
                </div>

                {/* Signal Bullet Points */}
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Detected Engagement Signals
                  </h4>
                  <ul className="space-y-1.5 pl-1">
                    {aiAnalysis.signals.map((signal, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Follow-up Draft</span>
                </button>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3 text-xs">
                <p className="text-slate-400">No AI analysis generated yet for this lead.</p>
                <button
                  onClick={handleRunAi}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg"
                >
                  {isAnalyzing ? "Analyzing context..." : "Run AI Analysis"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Followup Generator Modal */}
      {isCopilotOpen && (
        <FollowupGeneratorModal lead={lead} onClose={() => setIsCopilotOpen(false)} />
      )}
    </div>
  );
}
