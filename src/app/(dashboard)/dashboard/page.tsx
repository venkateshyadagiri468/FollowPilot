"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/modules/store/app-context";
import { ScorePill } from "@/components/domain/ScorePill";
import { LeadStatusBadge } from "@/components/domain/LeadStatusBadge";
import { FollowupGeneratorModal } from "@/components/domain/FollowupGeneratorModal";
import { MockLead } from "@/modules/store/mock-store";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Flame,
} from "lucide-react";

export default function DashboardPage() {
  const { leads, followups, usage } = useApp();
  const [selectedLeadForCopilot, setSelectedLeadForCopilot] = useState<MockLead | null>(null);

  // Action Queue Calculations
  const highPriorityLeads = leads.filter((l) => l.priority === "HIGH");
  const dueFollowups = followups.filter((f) => f.status === "SCHEDULED");

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* 1. Executive Action Queue Header */}
      <div className="bg-[#12151E] border border-[#1E2332] rounded-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> FollowPilot Action Workspace
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Sales Action Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="font-semibold text-amber-400 font-mono">{highPriorityLeads.length} leads</span> require immediate action based on buyer intent signals.
          </p>
        </div>

        {/* Action Metrics Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-[#191D28] border border-[#212634] rounded-md px-3.5 py-1.5 text-center">
            <span className="block text-base font-mono font-bold text-white leading-none">
              {highPriorityLeads.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider font-mono">
              High Intent
            </span>
          </div>
          <div className="bg-[#191D28] border border-[#212634] rounded-md px-3.5 py-1.5 text-center">
            <span className="block text-base font-mono font-bold text-indigo-400 leading-none">
              {dueFollowups.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider font-mono">
              Due Today
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: High Priority Action Queue & Due Follow-ups (2 Spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Queue: High Intent Leads */}
          <div className="bg-[#12151E] border border-[#1E2332] rounded-md overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-[#1E2332] bg-[#0E1017] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h2 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
                  Requires Immediate Attention ({highPriorityLeads.length})
                </h2>
              </div>
              <Link
                href="/leads"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#1E2332]">
              {highPriorityLeads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All high-priority leads have been followed up!
                </div>
              ) : (
                highPriorityLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 flex items-center justify-between hover:bg-[#181C28]/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-semibold text-white hover:text-indigo-400 text-xs transition-colors"
                        >
                          {lead.firstName} {lead.lastName}
                        </Link>
                        <ScorePill score={lead.score} priority={lead.priority} />
                        <LeadStatusBadge status={lead.status} />
                      </div>

                      <p className="text-xs text-slate-400">
                        {lead.jobTitle} at <span className="font-medium text-slate-200">{lead.company}</span>
                      </p>

                      <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Signal: Proposal viewed • 2 hours ago</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedLeadForCopilot(lead)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draft Follow-up</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Follow-ups Due Queue */}
          <div className="bg-[#12151E] border border-[#1E2332] rounded-md overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-[#1E2332] bg-[#0E1017] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h2 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
                  Scheduled Follow-ups Due ({dueFollowups.length})
                </h2>
              </div>
              <Link
                href="/followups"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>View queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#1E2332]">
              {dueFollowups.map((fol) => {
                const lead = leads.find((l) => l.id === fol.leadId);
                if (!lead) return null;

                return (
                  <div
                    key={fol.id}
                    className="p-4 flex items-center justify-between hover:bg-[#181C28]/80 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">
                          {lead.firstName} {lead.lastName} ({lead.company})
                        </span>
                        <ScorePill score={lead.score} priority={lead.priority} />
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">
                        "{fol.suggestedSubject}"
                      </p>
                      <p className="text-[11px] text-amber-400 font-mono">
                        Recommended: {fol.recommendedTiming}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedLeadForCopilot(lead)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-white transition-colors shrink-0 shadow-2xs border border-slate-700"
                    >
                      Review & Send
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Signal Insights & Usage Summary */}
        <div className="space-y-6">
          {/* AI Signals Card */}
          <div className="bg-[#12151E] border border-[#212634] text-white rounded-md p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-300">
                FollowPilot Intelligence
              </span>
            </div>

            <h3 className="font-semibold text-xs leading-snug text-slate-200">
              3 prospects displayed high intent activity within the last 24 hours.
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Acme Technologies requested pricing information. XYZ Solutions reviewed onboarding proposal. Apex Global replied to email follow-up.
            </p>

            <div className="pt-2 border-t border-[#212634] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">AI Runs Used</span>
              <span className="font-bold text-indigo-300">
                {usage.aiGenerationsCount} / {usage.aiGenerationsLimit}
              </span>
            </div>
          </div>

          {/* Activity Velocity */}
          <div className="bg-[#12151E] border border-[#1E2332] rounded-md p-5 space-y-3 shadow-2xs">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
              Sales Activity Velocity
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Emails Sent</span>
                <span className="font-bold text-white">{usage.emailsSentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reply Rate</span>
                <span className="font-bold text-emerald-400">24.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Avg. Time to Follow-up</span>
                <span className="font-bold text-indigo-400">3.2 hrs</span>
              </div>
            </div>

            <Link
              href="/analytics"
              className="block text-center text-xs font-medium text-indigo-400 hover:underline pt-1"
            >
              View telemetry metrics →
            </Link>
          </div>
        </div>
      </div>

      {/* Follow-up Draft Generator Modal */}
      {selectedLeadForCopilot && (
        <FollowupGeneratorModal
          lead={selectedLeadForCopilot}
          onClose={() => setSelectedLeadForCopilot(null)}
        />
      )}
    </div>
  );
}
