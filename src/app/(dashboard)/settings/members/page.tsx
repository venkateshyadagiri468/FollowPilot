"use client";

import { useState } from "react";
import { Users, UserPlus, Shield, Trash2, Mail, Loader2 } from "lucide-react";
import { inviteMemberAction, updateMemberRoleAction, removeMemberAction } from "@/app/actions/organization-actions";

interface MemberItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  joinedAt: string;
}

export default function MembersSettingsPage() {
  const [members, setMembers] = useState<MemberItem[]>([
    {
      id: "mem_demo_1",
      userId: "usr_demo_1",
      name: "Venkatesh (You)",
      email: "demo@followpilot.com",
      role: "OWNER",
      joinedAt: "2026-09-01",
    },
    {
      id: "mem_demo_2",
      userId: "usr_demo_2",
      name: "Sarah Jenkins",
      email: "sarah@acme.com",
      role: "ADMIN",
      joinedAt: "2026-09-02",
    },
  ]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const result = await inviteMemberAction(
      { email: inviteEmail, role: inviteRole },
      { userId: "usr_demo_1", orgId: "org_demo_1", role: "OWNER" }
    );

    setIsSubmitting(false);

    if (result.error) {
      setFeedback({ type: "error", msg: result.error });
      return;
    }

    setFeedback({ type: "success", msg: `Invitation sent to ${inviteEmail}` });
    setInviteEmail("");
    setIsInviteOpen(false);
  };

  const handleRoleChange = async (membershipId: string, newRole: any) => {
    const result = await updateMemberRoleAction(
      { targetMembershipId: membershipId, newRole },
      { userId: "usr_demo_1", orgId: "org_demo_1", role: "OWNER" }
    );

    if (result.error) {
      setFeedback({ type: "error", msg: result.error });
      return;
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === membershipId ? { ...m, role: newRole } : m))
    );
    setFeedback({ type: "success", msg: "Member role updated successfully" });
  };

  const handleRemoveMember = async (membershipId: string) => {
    const result = await removeMemberAction(
      { targetMembershipId: membershipId },
      { userId: "usr_demo_1", orgId: "org_demo_1", role: "OWNER" }
    );

    if (result.error) {
      setFeedback({ type: "error", msg: result.error });
      return;
    }

    setMembers((prev) => prev.filter((m) => m.id !== membershipId));
    setFeedback({ type: "success", msg: "Member removed from workspace" });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Workspace Members & Roles</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage teammate access, assign RBAC roles, and send invitations.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-indigo-600/20 text-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151E] border border-[#1E2332] rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E2332] pb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <span>Invite Workspace Member</span>
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-[#0B0C10] border border-[#2A3144] rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Assign RBAC Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-[#0B0C10] border border-[#2A3144] rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ADMIN">ADMIN (Full Member & Lead Ops)</option>
                  <option value="MEMBER">MEMBER (Lead Ops & Email Sending)</option>
                  <option value="VIEWER">VIEWER (Read-Only Access)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#2A3144] text-slate-300 hover:bg-[#1E2332] text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center space-x-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Invite</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-[#12151E] border border-[#1E2332] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E2332] bg-[#0E1017]/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2332] text-sm text-slate-200">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-[#181C28]/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-100 flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {m.name.charAt(0)}
                  </div>
                  <span>{m.name}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">{m.email}</td>
                <td className="py-3.5 px-4">
                  {m.role === "OWNER" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Shield className="w-3 h-3 mr-1" />
                      OWNER
                    </span>
                  ) : (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as any)}
                      className="bg-[#0B0C10] border border-[#2A3144] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-400 text-xs">{m.joinedAt}</td>
                <td className="py-3.5 px-4 text-right">
                  {m.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      title="Remove Member"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
