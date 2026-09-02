import React from "react";

interface ScorePillProps {
  score: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  showLabel?: boolean;
}

export function ScorePill({ score, priority, showLabel = true }: ScorePillProps) {
  let colorStyle = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300";
  if (priority === "HIGH") {
    colorStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300";
  } else if (priority === "MEDIUM") {
    colorStyle = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold text-xs px-2 py-0.5 rounded-full border ${colorStyle}`}
      title={`Lead Score: ${score}/100 (${priority} Priority)`}
    >
      <span>{score}</span>
      {showLabel && <span className="opacity-75 uppercase text-[10px] tracking-wider">{priority}</span>}
    </span>
  );
}
