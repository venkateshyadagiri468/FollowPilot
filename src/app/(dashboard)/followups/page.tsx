"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/modules/store/app-context";
import { ScorePill } from "@/components/domain/ScorePill";
import { LeadStatusBadge } from "@/components/domain/LeadStatusBadge";
import { FollowupGeneratorModal } from "@/components/domain/FollowupGeneratorModal";
import { MockLead, MockFollowup } from "@/modules/store/mock-store";
import { Clock, CheckCircle2, XCircle, Sparkles, Calendar, ArrowRight } from "lucide-react";

export default function FollowupsQueuePage() {
  const { followups, leads } = useApp();
  const [selectedLeadForCopilot, setSelectedLeadForCopilot] = useState<MockLead | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SCHEDULED" | "COMPLETED" | "CANCELLED">("SCHEDULED");

  const filteredFollowups = followups.filter((f) => {
    if (statusFilter === "ALL") return true;
    return f.status === statusFilter;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Follow-up Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review AI-scheduled follow-ups, edit drafts, and execute email sends.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setStatusFilter("SCHEDULED")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === "SCHEDULED"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Scheduled ({followups.filter((f) => f.status === "SCHEDULED").length})
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === "COMPLETED"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Completed ({followups.filter((f) => f.status === "COMPLETED").length})
          </button>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === "ALL"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredFollowups.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No follow-ups matching this filter.
            </div>
          ) : (
            filteredFollowups.map((fol) => {
              const lead = leads.find((l) => l.id === fol.leadId);
              if (!lead) return null;

              return (
                <div
                  key={fol.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 text-xs transition-colors"
                      >
                        {lead.firstName} {lead.lastName} ({lead.company})
                      </Link>
                      <ScorePill score={lead.score} priority={lead.priority} />
                      <LeadStatusBadge status={lead.status} />
                    </div>

                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Subject: {fol.suggestedSubject}
                    </p>

                    <p className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                      "{fol.suggestedBody}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                        <Clock className="w-3 h-3" />
                        {fol.recommendedTiming}
                      </span>
                      <span>•</span>
                      <span>AI Reason: {fol.reason}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {fol.status === "SCHEDULED" ? (
                      <button
                        onClick={() => setSelectedLeadForCopilot(lead)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Review & Send</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sent via Resend</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedLeadForCopilot && (
        <FollowupGeneratorModal
          lead={selectedLeadForCopilot}
          onClose={() => setSelectedLeadForCopilot(null)}
        />
      )}
    </div>
  );
}
