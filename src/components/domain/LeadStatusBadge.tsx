import React from "react";
import { MockLead } from "@/modules/store/mock-store";

interface LeadStatusBadgeProps {
  status: MockLead["status"];
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<MockLead["status"], { bg: string; text: string; dot: string }> = {
  NEW: { bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  CONTACTED: { bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500" },
  REPLIED: { bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  QUALIFIED: { bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-500" },
  PROPOSAL: { bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  WON: { bg: "bg-green-100 dark:bg-green-950/60 border-green-300 dark:border-green-800", text: "text-green-800 dark:text-green-200", dot: "bg-green-600" },
  LOST: { bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  DORMANT: { bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
};

export function LeadStatusBadge({ status, size = "sm" }: LeadStatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.NEW;
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${
        isSm ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      }`}
    >
      <span className={`rounded-full ${style.dot} ${isSm ? "w-1.5 h-1.5" : "w-2 h-2"}`} />
      {status}
    </span>
  );
}
