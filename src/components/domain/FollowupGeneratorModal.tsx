"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/modules/store/app-context";
import { MockLead, MockFollowup } from "@/modules/store/mock-store";
import { Sparkles, Send, Calendar, RefreshCw, X, AlertCircle, Info, Edit3 } from "lucide-react";
import { GeneratedFollowupDraft } from "@/modules/ai/openai-client";

interface FollowupGeneratorModalProps {
  lead: MockLead;
  followup?: MockFollowup;
  onClose: () => void;
}

export function FollowupGeneratorModal({ lead, followup, onClose }: FollowupGeneratorModalProps) {
  const { generateDraft, sendFollowupEmail, scheduleFollowup } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [subject, setSubject] = useState(followup?.suggestedSubject || "");
  const [body, setBody] = useState(followup?.suggestedBody || "");
  const [reason, setReason] = useState(followup?.reason || "");
  const [recommendedTiming, setRecommendedTiming] = useState(followup?.recommendedTiming || "Today at 2:30 PM");

  useEffect(() => {
    if (!subject && !body) {
      handleGenerateDraft();
    }
  }, []);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    const draft = await generateDraft(lead.id, userNotes);
    setIsGenerating(false);
    if (draft) {
      setSubject(draft.subject);
      setBody(draft.body);
      setReason(draft.reason);
      setRecommendedTiming(draft.recommendedTiming);
    }
  };

  const handleSendNow = async () => {
    if (!subject || !body) return;
    setIsSending(true);
    const success = await sendFollowupEmail(lead.id, followup?.id || `fol_${Date.now()}`, subject, body);
    setIsSending(false);
    if (success) {
      onClose();
    }
  };

  const handleSchedule = () => {
    scheduleFollowup(lead.id, subject, body, recommendedTiming);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                AI Follow-up Copilot
              </h3>
              <p className="text-xs text-slate-500">
                Drafting contextual outreach for <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.firstName} {lead.lastName}</span> ({lead.company})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          {/* AI Reason & Timing Highlight */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-lg p-3 flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                AI Strategy Recommendation: {recommendedTiming}
              </p>
              <p className="text-indigo-700/80 dark:text-indigo-300/80 text-[11px]">
                {reason || "Analysis indicates high prospect engagement with previous messages."}
              </p>
            </div>
          </div>

          {/* User Custom Context Notes */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-slate-400" />
              <span>Optional Custom Context / Instructions for AI</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. Mention 15% end-of-month pricing offer, ask for 15-min call on Thursday"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
              <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={isGenerating}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Draft Inputs */}
          {isGenerating ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-slate-500 font-medium animate-pulse">
                Assembling conversation history & crafting personalized email...
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Email Body (Human in the Loop Review)
                </label>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-sans leading-relaxed resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium text-xs"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSchedule}
              disabled={isGenerating || !subject}
              className="px-3.5 py-2 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>

            <button
              type="button"
              onClick={handleSendNow}
              disabled={isGenerating || isSending || !subject}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? "Sending via Resend..." : "Approve & Send Email"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
