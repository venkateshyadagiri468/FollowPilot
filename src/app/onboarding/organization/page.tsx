"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, UserPlus, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { createOrganizationAction, inviteMemberAction } from "@/app/actions/organization-actions";
import { useApp } from "@/modules/store/app-context";

export default function OnboardingPage() {
  const router = useRouter();
  const { setActiveOrgId } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orgName, setOrgName] = useState("");
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createOrganizationAction(
      { name: orgName },
      { userId: "usr_demo_1", orgId: "", role: "OWNER" }
    );

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data?.organization) {
      setCreatedOrgId(result.data.organization.id);
      setActiveOrgId(result.data.organization.id);
      setStep(2);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrgId || !inviteEmail) return;

    setIsSubmitting(true);
    const result = await inviteMemberAction(
      { email: inviteEmail, role: inviteRole },
      { userId: "usr_demo_1", orgId: createdOrgId, role: "OWNER" }
    );
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setInviteEmail("");
    setStep(3);
  };

  return (
    <main className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-xl bg-[#12151E] border border-[#1E2332] rounded-2xl p-8 shadow-2xl space-y-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-6 border-b border-[#1E2332]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              FP
            </div>
            <span className="font-semibold text-slate-100">FollowPilot Onboarding</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
            <span className={step >= 1 ? "text-indigo-400 font-semibold" : ""}>1. Workspace</span>
            <span>&rarr;</span>
            <span className={step >= 2 ? "text-indigo-400 font-semibold" : ""}>2. Team</span>
            <span>&rarr;</span>
            <span className={step === 3 ? "text-indigo-400 font-semibold" : ""}>3. Ready</span>
          </div>
        </div>

        {/* Step 1: Create Organization */}
        {step === 1 && (
          <form onSubmit={handleCreateWorkspace} className="space-y-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Create your sales workspace</h2>
              <p className="text-sm text-slate-400">
                This is where your leads, intent scoring, AI follow-up drafts, and analytics will live.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Workspace / Organization Name
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Sales Team"
                className="w-full bg-[#0B0C10] border border-[#2A3144] rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !orgName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create Workspace & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Invite Teammates */}
        {step === 2 && (
          <form onSubmit={handleSendInvite} className="space-y-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Invite your team (Optional)</h2>
              <p className="text-sm text-slate-400">
                Collaborate with sales reps, managers, and executives in your new workspace.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Teammate Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-[#0B0C10] border border-[#2A3144] rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-[#0B0C10] border border-[#2A3144] rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MEMBER">MEMBER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !inviteEmail.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Send Invitation</span>}
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 border border-[#2A3144] hover:bg-[#1E2332] text-slate-300 font-medium rounded-lg text-sm transition-colors"
              >
                Skip for now
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Workspace Ready */}
        {step === 3 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Your workspace is ready!</h2>
              <p className="text-sm text-slate-400">
                Workspace <strong className="text-indigo-400 font-semibold">{orgName || "Acme Sales"}</strong> is fully set up. You are assigned as <strong className="text-amber-400">OWNER</strong>.
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-colors"
            >
              <span>Enter Workspace Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
