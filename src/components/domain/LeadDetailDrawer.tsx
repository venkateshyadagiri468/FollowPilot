"use client";

import React, { useState } from "react";
import { X, Mail, Phone, Building, Briefcase, Calendar, Shield, Trash2, ArrowRight, Activity } from "lucide-react";
import { MockLead } from "@/modules/store/mock-store";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { ScorePill } from "./ScorePill";
import { ActivityTimeline } from "./ActivityTimeline";
import { updateLeadStatusAction, deleteLeadAction } from "@/app/actions/lead-actions";
import { getAllowedNextStatuses, LeadStatus } from "@/modules/leads/lead-state-machine";
import { useApp } from "@/modules/store/app-context";
import { toast } from "sonner";

interface LeadDetailDrawerProps {
  lead: MockLead;
  onClose: () => void;
}

export function LeadDetailDrawer({ lead, onClose }: LeadDetailDrawerProps) {
  const { updateLeadStatus, deleteLead, activities } = useApp();
  const [currentStatus, setCurrentStatus] = useState<MockLead["status"]>(lead.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedNextStatuses = getAllowedNextStatuses(currentStatus as LeadStatus);

  const handleStatusChange = async (newStatus: MockLead["status"]) => {
    setIsSubmitting(true);
    const result = await updateLeadStatusAction(
      { leadId: lead.id, newStatus: newStatus as LeadStatus },
      { userId: "usr_demo_1", orgId: "org_demo_1", role: "OWNER" }
    );
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setCurrentStatus(newStatus);
    updateLeadStatus(lead.id, newStatus);
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete lead ${lead.firstName} ${lead.lastName}?`)) return;

    const result = await deleteLeadAction(
      { leadId: lead.id },
      { userId: "usr_demo_1", orgId: "org_demo_1", role: "OWNER" }
    );

    if (result.error) {
      toast.error(result.error);
      return;
    }

    deleteLead(lead.id);
    onClose();
  };

  const leadActivities = activities[lead.id] || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-[#12151E] border-l border-[#1E2332] w-full max-w-xl h-full shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#1E2332] flex items-center justify-between bg-[#0E1017]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-sm">
              {lead.firstName.charAt(0)}
              {lead.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {lead.firstName} {lead.lastName}
              </h2>
              <p className="text-xs text-slate-400 flex items-center space-x-2">
                <span>{lead.jobTitle}</span>
                <span>•</span>
                <span className="text-indigo-400 font-medium">{lead.company}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              title="Delete Lead"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Intent Score Bar */}
          <div className="bg-[#0B0C10] p-4 rounded-xl border border-[#1E2332] flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Pipeline Status
              </div>
              <div className="flex items-center space-x-2">
                <LeadStatusBadge status={currentStatus} />
                {allowedNextStatuses.length > 0 && (
                  <select
                    disabled={isSubmitting}
                    value=""
                    onChange={(e) => e.target.value && handleStatusChange(e.target.value as any)}
                    className="bg-[#181C28] border border-[#2A3144] text-xs text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Move status &rarr;</option>
                    {allowedNextStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Intent Score
              </div>
              <ScorePill score={lead.score} priority={lead.priority} />
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#0B0C10] p-3 rounded-lg border border-[#1E2332] space-y-1">
              <div className="text-slate-400 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email Address</span>
              </div>
              <div className="font-semibold text-slate-200 truncate">{lead.email}</div>
            </div>

            <div className="bg-[#0B0C10] p-3 rounded-lg border border-[#1E2332] space-y-1">
              <div className="text-slate-400 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Phone Number</span>
              </div>
              <div className="font-semibold text-slate-200 truncate">{lead.phone || "Not provided"}</div>
            </div>

            <div className="bg-[#0B0C10] p-3 rounded-lg border border-[#1E2332] space-y-1">
              <div className="text-slate-400 flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>Company</span>
              </div>
              <div className="font-semibold text-slate-200 truncate">{lead.company}</div>
            </div>

            <div className="bg-[#0B0C10] p-3 rounded-lg border border-[#1E2332] space-y-1">
              <div className="text-slate-400 flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Title</span>
              </div>
              <div className="font-semibold text-slate-200 truncate">{lead.jobTitle}</div>
            </div>
          </div>

          {/* Activity Timeline Audit Feed */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Activity & Interaction Timeline</span>
            </h3>

            <div className="bg-[#0B0C10] p-4 rounded-xl border border-[#1E2332]">
              <ActivityTimeline leadId={lead.id} activities={leadActivities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
