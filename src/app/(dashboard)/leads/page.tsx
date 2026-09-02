"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/modules/store/app-context";
import { ScorePill } from "@/components/domain/ScorePill";
import { LeadStatusBadge } from "@/components/domain/LeadStatusBadge";
import { FollowupGeneratorModal } from "@/components/domain/FollowupGeneratorModal";
import { MockLead } from "@/modules/store/mock-store";
import {
  Search,
  Filter,
  ArrowUpDown,
  UploadCloud,
  Plus,
  Trash2,
  Sparkles,
  UserCheck,
  ChevronRight,
  Building,
  Mail,
} from "lucide-react";
import { NewLeadModal } from "@/components/domain/NewLeadModal";

export default function LeadsPage() {
  const { leads, updateLeadStatus, deleteLead } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"score" | "name" | "company">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [copilotLead, setCopilotLead] = useState<MockLead | null>(null);

  // Filter Logic
  const filteredLeads = leads
    .filter((l) => {
      const matchSearch =
        l.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
      const matchPriority = priorityFilter === "ALL" || l.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return sortOrder === "desc" ? b.score - a.score : a.score - b.score;
      }
      if (sortBy === "name") {
        return sortOrder === "desc"
          ? b.firstName.localeCompare(a.firstName)
          : a.firstName.localeCompare(b.firstName);
      }
      return sortOrder === "desc"
        ? b.company.localeCompare(a.company)
        : a.company.localeCompare(b.company);
    });

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((i) => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleBulkStatusChange = (status: MockLead["status"]) => {
    selectedLeadIds.forEach((id) => updateLeadStatus(id, status));
    setSelectedLeadIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedLeadIds.length} selected leads?`)) {
      selectedLeadIds.forEach((id) => deleteLead(id));
      setSelectedLeadIds([]);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Lead Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your sales pipeline, track intent scores, and execute contextual follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/leads/import"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </Link>

          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Bulk Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="REPLIED">REPLIED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="PROPOSAL">PROPOSAL</option>
                <option value="WON">WON</option>
                <option value="LOST">LOST</option>
                <option value="DORMANT">DORMANT</option>
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 text-xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority (75+)</option>
              <option value="MEDIUM">Medium Priority (55+)</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => {
                if (sortBy === "score") {
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                } else {
                  setSortBy("score");
                  setSortOrder("desc");
                }
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Score {sortBy === "score" ? (sortOrder === "desc" ? "↓" : "↑") : ""}</span>
            </button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedLeadIds.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 flex items-center justify-between text-xs animate-in fade-in duration-100">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200">
              {selectedLeadIds.length} leads selected
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Change Status:</span>
              <button
                onClick={() => handleBulkStatusChange("CONTACTED")}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 font-semibold rounded text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
              >
                CONTACTED
              </button>
              <button
                onClick={() => handleBulkStatusChange("QUALIFIED")}
                className="px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 font-semibold rounded text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
              >
                QUALIFIED
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leads Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3 px-4">Lead / Contact</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority / Score</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No leads match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-indigo-50/30 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectLead(lead.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Lead Contact */}
                      <td className="py-3 px-4">
                        <div>
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-xs transition-colors flex items-center gap-1 group"
                          >
                            <span>{lead.firstName} {lead.lastName}</span>
                            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </Link>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{lead.email}</span>
                          </p>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {lead.company}
                        </div>
                        <p className="text-[11px] text-slate-400">{lead.jobTitle}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <LeadStatusBadge status={lead.status} />
                      </td>

                      {/* Score */}
                      <td className="py-3 px-4">
                        <ScorePill score={lead.score} priority={lead.priority} />
                      </td>

                      {/* Last Activity */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(lead.lastActivityAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          {lead.assignedToName}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setCopilotLead(lead)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Draft</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lead Modal */}
      {isNewLeadOpen && <NewLeadModal onClose={() => setIsNewLeadOpen(false)} />}

      {/* Copilot Follow-up Modal */}
      {copilotLead && (
        <FollowupGeneratorModal
          lead={copilotLead}
          onClose={() => setCopilotLead(null)}
        />
      )}
    </div>
  );
}
