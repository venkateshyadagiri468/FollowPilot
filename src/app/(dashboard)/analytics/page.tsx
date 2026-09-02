"use client";

import React from "react";
import { useApp } from "@/modules/store/app-context";
import { BarChart3, TrendingUp, Mail, Eye, MessageSquareReply, Users, CheckCircle, ShieldCheck } from "lucide-react";

export default function AnalyticsPage() {
  const { leads, usage } = useApp();

  const repliedCount = leads.filter((l) => l.status === "REPLIED").length;
  const proposalCount = leads.filter((l) => l.status === "PROPOSAL").length;
  const wonCount = leads.filter((l) => l.status === "WON").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Sales Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics on response rates, pipeline conversion, and follow-up efficiency.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Leads Managed</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white block">
            {leads.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">
            +18% from last month
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Email Outreach Sent</span>
            <Mail className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white block">
            {usage.emailsSentCount}
          </span>
          <span className="text-[11px] text-slate-400">Resend verified delivery</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Prospect Replies</span>
            <MessageSquareReply className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">
            {repliedCount}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">
            24.5% response rate
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>AI Copilot Generations</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 block">
            {usage.aiGenerationsCount}
          </span>
          <span className="text-[11px] text-slate-400">
            {usage.aiGenerationsLimit - usage.aiGenerationsCount} remaining
          </span>
        </div>
      </div>

      {/* Pipeline Stage Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
          Pipeline Funnel Conversion
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">NEW & Contacted Leads</span>
              <span className="font-bold text-slate-900 dark:text-white">{leads.length}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 w-full" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Replied & Engaged</span>
              <span className="font-bold text-emerald-600">{repliedCount}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[60%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">Proposals Sent</span>
              <span className="font-bold text-purple-600">{proposalCount}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[35%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
