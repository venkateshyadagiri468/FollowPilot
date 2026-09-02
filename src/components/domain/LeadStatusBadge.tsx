import React from "react";
import { MockLead } from "@/modules/store/mock-store";

interface LeadStatusBadgeProps {
  status: MockLead["status"];
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<MockLead["status"], { bg: string; text: string; dot: string }> = {
  NEW: { bg: "bg-slate-100 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
  CONTACTED: { bg: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500" },
  REPLIED: { bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  QUALIFIED: { bg: "bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-500" },
  PROPOSAL: { bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  WON: { bg: "bg-emerald-100 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800", text: "text-emerald-800 dark:text-emerald-200", dot: "bg-emerald-600" },
  LOST: { bg: "bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800", text: "text-slate-500 dark:text-slate-400", dot: "bg-slate-400" },
  DORMANT: { bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
};

export function LeadStatusBadge({ status, size = "sm" }: LeadStatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.NEW;
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${style.bg} ${style.text} ${
        isSm ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`rounded-full ${style.dot} ${isSm ? "w-1.5 h-1.5" : "w-2 h-2"}`} />
      <span>{status}</span>
    </span>
  );
}
