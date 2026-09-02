"use client";

import React, { useState } from "react";
import { useApp } from "@/modules/store/app-context";
import { Building2, Users, CreditCard, Shield, Sparkles, Check, Plus, Mail } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { org, usage, user } = useApp();
  const [activeTab, setActiveTab] = useState<"ORG" | "MEMBERS" | "BILLING">("ORG");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const [members, setMembers] = useState([
    { id: "1", name: user.name, email: user.email, role: "OWNER", joinedAt: "2026-08-15" },
    { id: "2", name: "Sarah Jenkins", email: "sarah@acme.com", role: "ADMIN", joinedAt: "2026-08-20" },
  ]);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setMembers([
      ...members,
      {
        id: Date.now().toString(),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
        joinedAt: new Date().toISOString().split("T")[0],
      },
    ]);

    setInviteEmail("");
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Organization Settings & Billing
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage team workspaces, member roles, subscription entitlements, and usage quotas.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("ORG")}
          className={`pb-2.5 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "ORG"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("MEMBERS")}
          className={`pb-2.5 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "MEMBERS"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Members ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("BILLING")}
          className={`pb-2.5 px-1 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "BILLING"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription & Billing</span>
        </button>
      </div>

      {/* TAB 1: ORGANIZATION PROFILE */}
      {activeTab === "ORG" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-2xs text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Organization Identity
          </h3>

          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Organization Name
              </label>
              <input
                type="text"
                defaultValue={org.name}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Workspace Slug
              </label>
              <input
                type="text"
                disabled
                value={org.slug}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => toast.success("Organization profile saved")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM MEMBERS & RBAC */}
      {activeTab === "MEMBERS" && (
        <div className="space-y-6 text-xs">
          {/* Invite Member Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-2xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Invite Team Member
            </h3>

            <form onSubmit={handleSendInvite} className="flex gap-2">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="MEMBER">MEMBER</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shrink-0 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Invite</span>
              </button>
            </form>
          </div>

          {/* Members List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                      <div className="text-[11px] text-slate-400">{m.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{m.joinedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSCRIPTION & BILLING */}
      {activeTab === "BILLING" && (
        <div className="space-y-6 text-xs">
          {/* Current Entitlements Overview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Active Subscription
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {usage.plan} Tier Plan
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-full">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Leads Limit</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {usage.leadsCount} / {usage.leadsLimit}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">AI Generations</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {usage.aiGenerationsCount} / {usage.aiGenerationsLimit}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Email Sends</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {usage.emailsSentCount} / {usage.emailsSentLimit}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* FREE */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">FREE</h4>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">₹0</div>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>50 Leads limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>20 AI Generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100 Email Sends</span>
                </li>
              </ul>
            </div>

            {/* PRO */}
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-600 rounded-xl p-5 space-y-4 relative shadow-md">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                Current Plan
              </span>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">PRO</h4>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ₹999 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2,500 Leads limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1,500 AI Generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>5,000 Email Sends</span>
                </li>
              </ul>
            </div>

            {/* BUSINESS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">BUSINESS</h4>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹5,999 <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>10,000 Leads limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>5,000 AI Generations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>25,000 Email Sends</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Unlimited Team Seats</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
