"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { AIAnalysisEntity } from "@/features/ai-analysis/schemas";

interface AIIntelligenceCardProps {
  analysis: AIAnalysisEntity | null;
  isLoading?: boolean;
  onAnalyzeNow?: () => void;
  onHumanOverrideAction?: (newAction: string) => void;
}

export const AIIntelligenceCard: React.FC<AIIntelligenceCardProps> = ({
  analysis,
  isLoading = false,
  onAnalyzeNow,
  onHumanOverrideAction,
}) => {
  const [selectedOverride, setSelectedOverride] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-[#131622] border border-[#212738] rounded-lg p-5 skeleton-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-[#212738] rounded-full animate-pulse" />
          <div className="h-4 w-40 bg-[#212738] rounded" />
        </div>
        <div className="h-16 bg-[#1A1E2E] rounded mb-3" />
        <div className="h-10 bg-[#1A1E2E] rounded" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-[#131622] border border-[#212738] rounded-lg p-5 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1C2234] text-indigo-400 mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-[#F4F5F8] mb-1">
          AI Intelligence Ready
        </h4>
        <p className="text-xs text-[#8F9BBA] mb-4">
          Analyze lead activity, intent signals, and recent conversation context.
        </p>
        <button
          onClick={onAnalyzeNow}
          className="inline-flex items-center px-3.5 py-1.5 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors focus-ring"
        >
          <Zap className="w-3.5 h-3.5 mr-1.5" />
          Run AI Analysis
        </button>
      </div>
    );
  }

  const intentColorMap: Record<string, string> = {
    HIGH: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    LOW: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    UNKNOWN: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  };

  const confidencePct = Math.round((analysis.intentConfidence || 0.8) * 100);
  const activeAction = analysis.humanOverrideAction || selectedOverride || analysis.recommendedAction;
  const isOverridden = Boolean(analysis.humanOverrideAction || selectedOverride);

  const handleOverride = (action: string) => {
    setSelectedOverride(action);
    if (onHumanOverrideAction) {
      onHumanOverrideAction(action);
    }
  };

  return (
    <div className="bg-[#131622] border border-[#212738] rounded-lg p-5 space-y-4">
      {/* Header Badge & Action Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase border tracking-wider ${
              intentColorMap[analysis.intent] || intentColorMap.UNKNOWN
            }`}
          >
            {analysis.intent} INTENT
          </span>
          <span className="text-[11px] text-[#8F9BBA] font-mono">
            {confidencePct}% confidence
          </span>
        </div>

        <button
          onClick={onAnalyzeNow}
          className="p-1 rounded text-[#8F9BBA] hover:text-[#F4F5F8] hover:bg-[#1C2234] transition-colors"
          title="Re-run AI Analysis"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fallback Warning Notice */}
      {analysis.analysisSource === "DETERMINISTIC_FALLBACK" && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Deterministic Fallback Analysis:</strong> AI Provider unavailable. Engagement evaluated via scoring engine.
          </span>
        </div>
      )}

      {/* Recommended Action & Timing */}
      <div className="bg-[#1A1E2E] border border-[#262D42] rounded p-3 flex items-start justify-between">
        <div>
          <span className="text-[10px] font-semibold text-[#8F9BBA] uppercase tracking-wider block mb-1">
            Recommended Action {isOverridden && "(Human Override)"}
          </span>
          <span className="text-sm font-semibold text-indigo-300 flex items-center">
            {isOverridden ? (
              <UserCheck className="w-4 h-4 mr-1.5 text-emerald-400" />
            ) : (
              <Zap className="w-4 h-4 mr-1.5 text-indigo-400" />
            )}
            {activeAction.replace(/_/g, " ")}
          </span>
        </div>
        {analysis.recommendedDelayHours !== null && (
          <div className="text-right">
            <span className="text-[10px] font-semibold text-[#8F9BBA] uppercase tracking-wider block mb-1">
              Suggested Timing
            </span>
            <span className="text-xs text-[#C3C9D7] flex items-center justify-end">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#8F9BBA]" />
              Within {analysis.recommendedDelayHours}h
            </span>
          </div>
        )}
      </div>

      {/* Reasoning Summary */}
      <div>
        <h5 className="text-[11px] font-semibold text-[#8F9BBA] uppercase tracking-wider mb-1.5">
          Key Insight & Reasoning
        </h5>
        <p className="text-xs text-[#D8DEEB] leading-relaxed bg-[#0B0C10]/50 p-2.5 rounded border border-[#1F2638]">
          {analysis.reasoning}
        </p>
      </div>

      {/* Evidence Bullet Points with Provenance */}
      {analysis.evidence && analysis.evidence.length > 0 && (
        <div>
          <h5 className="text-[11px] font-semibold text-[#8F9BBA] uppercase tracking-wider mb-1.5">
            Traceable Evidence & Signals
          </h5>
          <ul className="space-y-1.5">
            {analysis.evidence.map((item, idx) => (
              <li key={idx} className="flex items-start text-xs text-[#A0AEC0]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0 mt-0.5" />
                <div>
                  <span>
                    <strong className="text-[#C3C9D7] font-medium">{item.type}:</strong>{" "}
                    {item.description}
                  </span>
                  {item.sourceType && (
                    <span className="block text-[10px] text-[#8F9BBA] font-mono mt-0.5">
                      Source: {item.sourceType} {item.sourceId ? `#${item.sourceId}` : ""}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Human Override Controls */}
      <div className="pt-2 border-t border-[#212738] flex items-center justify-between">
        <span className="text-[10px] text-[#8F9BBA]">
          Model: {analysis.model} ({analysis.promptVersion})
        </span>

        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-[#8F9BBA] mr-1">Override:</span>
          <button
            onClick={() => handleOverride("FOLLOW_UP_NOW")}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
              activeAction === "FOLLOW_UP_NOW"
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-[#1A1E2E] text-[#C3C9D7] border-[#262D42] hover:bg-[#212738]"
            }`}
          >
            Now
          </button>
          <button
            onClick={() => handleOverride("WAIT_FOR_RESPONSE")}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
              activeAction === "WAIT_FOR_RESPONSE"
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-[#1A1E2E] text-[#C3C9D7] border-[#262D42] hover:bg-[#212738]"
            }`}
          >
            Wait
          </button>
        </div>
      </div>
    </div>
  );
};
