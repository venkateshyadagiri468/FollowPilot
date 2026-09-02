import React from "react";

interface ScorePillProps {
  score: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  showLabel?: boolean;
}

export function ScorePill({ score, priority, showLabel = true }: ScorePillProps) {
  let colorStyle = "bg-slate-800/80 text-slate-300 border-slate-700";
  if (priority === "HIGH") {
    colorStyle = "bg-amber-500/15 text-amber-300 border-amber-500/30";
  } else if (priority === "MEDIUM") {
    colorStyle = "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 rounded-md border font-semibold tracking-tight ${colorStyle}`}
      title={`Lead Priority Score: ${score}/100 (${priority})`}
    >
      <span>{score}</span>
      {showLabel && <span className="opacity-80 text-[10px] uppercase tracking-wider font-sans font-bold">{priority}</span>}
    </span>
  );
}
