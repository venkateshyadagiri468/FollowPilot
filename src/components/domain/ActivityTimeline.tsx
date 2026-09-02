"use client";

import React, { useState } from "react";
import { MockActivity } from "@/modules/store/mock-store";
import {
  UserPlus,
  Send,
  CheckCheck,
  Eye,
  MousePointerClick,
  MessageSquareReply,
  PhoneCall,
  FileText,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Tag,
  Plus,
} from "lucide-react";
import { useApp } from "@/modules/store/app-context";

interface ActivityTimelineProps {
  leadId: string;
  activities: MockActivity[];
}

const ACTIVITY_ICONS: Record<MockActivity["type"], { icon: any; color: string; label: string }> = {
  LEAD_CREATED: { icon: UserPlus, color: "text-blue-500 bg-blue-50 dark:bg-blue-950", label: "Lead Created" },
  EMAIL_SENT: { icon: Send, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950", label: "Email Sent" },
  EMAIL_DELIVERED: { icon: CheckCheck, color: "text-slate-500 bg-slate-50 dark:bg-slate-900", label: "Email Delivered" },
  EMAIL_OPENED: { icon: Eye, color: "text-purple-500 bg-purple-50 dark:bg-purple-950", label: "Email Opened" },
  EMAIL_CLICKED: { icon: MousePointerClick, color: "text-teal-500 bg-teal-50 dark:bg-teal-950", label: "Link Clicked" },
  EMAIL_REPLIED: { icon: MessageSquareReply, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950", label: "Prospect Replied" },
  CALL_COMPLETED: { icon: PhoneCall, color: "text-amber-500 bg-amber-50 dark:bg-amber-950", label: "Call Completed" },
  NOTE_ADDED: { icon: FileText, color: "text-slate-600 bg-slate-100 dark:bg-slate-800", label: "Note Added" },
  PROPOSAL_SENT: { icon: FileSpreadsheet, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950", label: "Proposal Sent" },
  PROPOSAL_VIEWED: { icon: Eye, color: "text-rose-600 bg-rose-50 dark:bg-rose-950", label: "Proposal Viewed" },
  FOLLOWUP_CREATED: { icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950", label: "Follow-up Scheduled" },
  FOLLOWUP_COMPLETED: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950", label: "Follow-up Done" },
  STATUS_CHANGED: { icon: Tag, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950", label: "Status Updated" },
};

export function ActivityTimeline({ leadId, activities }: ActivityTimelineProps) {
  const { addLeadNote } = useApp();
  const [noteText, setNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addLeadNote(leadId, noteText.trim());
    setNoteText("");
    setIsAddingNote(false);
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header & Add Note Trigger */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
          Activity Timeline ({activities.length})
        </h4>
        <button
          onClick={() => setIsAddingNote(!isAddingNote)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Note</span>
        </button>
      </div>

      {/* Note Input Box */}
      {isAddingNote && (
        <form onSubmit={handleAddNote} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2">
          <textarea
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type quick call note or customer detail..."
            className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="px-2.5 py-1 text-slate-500 text-xs hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md text-xs"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Chronological Stream */}
      {activities.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          No activity recorded yet.
        </div>
      ) : (
        <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-4">
          {activities.map((act) => {
            const style = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.LEAD_CREATED;
            const Icon = style.icon;
            const timeFormatted = new Date(act.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={act.id} className="relative group">
                {/* Timeline Icon Marker */}
                <div
                  className={`absolute -left-[25px] top-0.5 w-6 h-6 rounded-full border border-white dark:border-slate-900 flex items-center justify-center ${style.color}`}
                >
                  <Icon className="w-3 h-3" />
                </div>

                <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {style.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {timeFormatted}
                    </span>
                  </div>

                  {act.actorName && (
                    <p className="text-[11px] text-slate-500">
                      by <span className="font-medium text-slate-700 dark:text-slate-300">{act.actorName}</span>
                    </p>
                  )}

                  {/* Metadata display */}
                  {act.metadata && (
                    <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded px-2 py-1 border border-slate-100 dark:border-slate-800 font-mono">
                      {act.metadata.note && <p className="font-sans italic">{act.metadata.note}</p>}
                      {act.metadata.snippet && <p className="font-sans">"{act.metadata.snippet}"</p>}
                      {act.metadata.subject && <p>Subject: {act.metadata.subject}</p>}
                      {act.metadata.from && act.metadata.to && (
                        <p>Status: {act.metadata.from} → {act.metadata.to}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
