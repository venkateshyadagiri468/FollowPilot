"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/modules/store/app-context";
import { ScorePill } from "@/components/domain/ScorePill";
import { LeadStatusBadge } from "@/components/domain/LeadStatusBadge";
import { FollowupGeneratorModal } from "@/components/domain/FollowupGeneratorModal";
import { MockLead, MockFollowup } from "@/modules/store/mock-store";
import {
  Sparkles,
  ArrowRight,
  Clock,
  MessageSquare,
  Users,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { leads, followups, activities, usage } = useApp();
  const [selectedLeadForCopilot, setSelectedLeadForCopilot] = useState<MockLead | null>(null);

  // Calculate Action Center Metrics
  const highPriorityLeads = leads.filter((l) => l.priority === "HIGH");
  const dueFollowups = followups.filter((f) => f.status === "SCHEDULED");
  const contactedCount = leads.filter((l) => l.status !== "NEW").length;
  const repliedCount = leads.filter((l) => l.status === "REPLIED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Good Morning Header & Priority Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Action Center
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Good morning, Venkatesh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You have <span className="font-semibold text-slate-900 dark:text-white">{highPriorityLeads.length} high-priority leads</span> requiring attention today.
          </p>
        </div>

        {/* Action Metrics Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg px-3.5 py-2 text-center">
            <span className="block text-lg font-bold text-slate-900 dark:text-white leading-none">
              {leads.length}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Total Leads
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg px-3.5 py-2 text-center">
            <span className="block text-lg font-bold text-indigo-600 dark:text-indigo-400 leading-none">
              {contactedCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Contacted
            </span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-lg px-3.5 py-2 text-center">
            <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-none">
              {repliedCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Replies
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: High Priority Leads & Due Follow-ups (2 Spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* High Priority Leads Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                  High Priority Leads ({highPriorityLeads.length})
                </h2>
              </div>
              <Link
                href="/leads"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                <span>View all leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {highPriorityLeads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All high-priority leads have been followed up!
                </div>
              ) : (
                highPriorityLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
                        >
                          {lead.firstName} {lead.lastName}
                        </Link>
                        <ScorePill score={lead.score} priority={lead.priority} />
                        <LeadStatusBadge status={lead.status} />
                      </div>

                      <p className="text-xs text-slate-500">
                        {lead.jobTitle} at <span className="font-medium text-slate-700 dark:text-slate-300">{lead.company}</span>
                      </p>

                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Last active 2 hours ago</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedLeadForCopilot(lead)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Follow up</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Follow-ups Due Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                  Follow-ups Due Today ({dueFollowups.length})
                </h2>
              </div>
              <Link
                href="/followups"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                <span>View queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {dueFollowups.map((fol) => {
                const lead = leads.find((l) => l.id === fol.leadId);
                if (!lead) return null;

                return (
                  <div
                    key={fol.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white text-xs">
                          {lead.firstName} {lead.lastName} ({lead.company})
                        </span>
                        <ScorePill score={lead.score} priority={lead.priority} />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        "{fol.suggestedSubject}"
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        Recommended: {fol.recommendedTiming}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedLeadForCopilot(lead)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 transition-colors shrink-0"
                    >
                      Review & Send
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Quick Stats */}
        <div className="space-y-6">
          {/* AI Intelligence Summary Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
              <Zap className="w-36 h-36" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  FollowPilot Engine
                </span>
              </div>

              <h3 className="font-bold text-base leading-tight">
                3 prospects showed strong buyer signals in the last 24h
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Acme Technologies requested pricing details. XYZ Solutions opened proposal pages twice. Apex Global replied with onboarding inquiries.
              </p>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Monthly AI quota</span>
                <span className="font-bold text-indigo-300">
                  {usage.aiGenerationsCount} / {usage.aiGenerationsLimit} runs
                </span>
              </div>
            </div>
          </div>

          {/* Quick Performance Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Sales Activity Velocity
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Emails Sent This Month</span>
                <span className="font-bold text-slate-900 dark:text-white">{usage.emailsSentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Response Rate</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">24.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Avg. Time to Follow-up</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">3.2 hours</span>
              </div>
            </div>

            <Link
              href="/analytics"
              className="block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-2"
            >
              View detailed metrics →
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
