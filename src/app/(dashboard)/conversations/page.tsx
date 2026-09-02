"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/modules/store/app-context";
import { ScorePill } from "@/components/domain/ScorePill";
import { LeadStatusBadge } from "@/components/domain/LeadStatusBadge";
import { MessageSquare, Mail, Send, Sparkles, User, ChevronRight } from "lucide-react";
import { FollowupGeneratorModal } from "@/components/domain/FollowupGeneratorModal";
import { MockLead } from "@/modules/store/mock-store";

export default function ConversationsPage() {
  const { conversations, leads } = useApp();
  const conversationList = Object.values(conversations);
  const [activeConvId, setActiveConvId] = useState<string>(conversationList[0]?.id || "");
  const [copilotLead, setCopilotLead] = useState<MockLead | null>(null);

  const activeConv = conversationList.find((c) => c.id === activeConvId) || conversationList[0];
  const activeLead = activeConv ? leads.find((l) => l.id === activeConv.leadId) : null;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Sales Inbox & Conversations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Unified inbox of prospect email exchanges and AI context reconstruction.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
        {/* Left Column: Thread List */}
        <div className="border-r border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
          {conversationList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No conversations started yet.
            </div>
          ) : (
            conversationList.map((conv) => {
              const lead = leads.find((l) => l.id === conv.leadId);
              if (!lead) return null;

              const lastMsg = conv.messages[conv.messages.length - 1];
              const isActive = conv.id === activeConvId;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-l-4 border-indigo-600"
                      : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {lead.firstName} {lead.lastName}
                    </span>
                    <ScorePill score={lead.score} priority={lead.priority} showLabel={false} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mb-1">
                    {conv.subject}
                  </p>
                  {lastMsg && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                      "{lastMsg.bodyText}"
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (2 Spans): Active Message Thread Details */}
        <div className="md:col-span-2 flex flex-col justify-between p-6 bg-slate-50/30 dark:bg-slate-900/30">
          {activeConv && activeLead ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Active Thread Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {activeConv.subject}
                    </h3>
                    <p className="text-xs text-slate-500">
                      With <Link href={`/leads/${activeLead.id}`} className="font-semibold text-indigo-600 hover:underline">{activeLead.firstName} {activeLead.lastName}</Link> ({activeLead.company})
                    </p>
                  </div>

                  <button
                    onClick={() => setCopilotLead(activeLead)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reply with AI</span>
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {activeConv.messages.map((msg) => {
                    const isOutbound = msg.direction === "OUTBOUND";
                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border text-xs leading-relaxed ${
                          isOutbound
                            ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ml-8"
                            : "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 mr-8"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {isOutbound ? "You (Outbound)" : `${activeLead.firstName} ${activeLead.lastName}`}
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
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                          {msg.bodyText}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              Select a conversation thread on the left to view messages.
            </div>
          )}
        </div>
      </div>

      {copilotLead && (
        <FollowupGeneratorModal
          lead={copilotLead}
          onClose={() => setCopilotLead(null)}
        />
      )}
    </div>
  );
}
