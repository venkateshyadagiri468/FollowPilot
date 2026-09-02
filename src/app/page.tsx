import React from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import {
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default async function MarketingLandingPage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-slate-100 font-sans antialiased">
      {/* Top Marketing Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between bg-[#0B0C10] border-b border-[#1E2332]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">
            FollowPilot
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs transition-all"
              >
                Start Free Trial
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs transition-all flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <UserButton />
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Assisted Sales Follow-up Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Never let a valuable lead go cold.
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          FollowPilot watches your sales activity, identifies leads that need attention, calculates buyer intent, and helps you send the right contextual follow-up at the right time.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isSignedIn ? (
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-md text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Start For Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-md text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3 bg-[#12151E] border border-[#222838] text-slate-200 font-semibold rounded-md text-sm hover:bg-[#181C28] transition-all"
          >
            See How It Works
          </a>
        </div>

        <div className="pt-4 flex items-center justify-center gap-6 text-slate-400 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Human-in-the-loop email safety
          </span>
        </div>
      </section>

      {/* Interactive Application Preview Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-[#12151E] border border-[#1E2332] rounded-xl shadow-2xl overflow-hidden">
          {/* Mock Browser Header */}
          <div className="bg-[#0E1017] px-4 py-3 border-b border-[#1E2332] flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs text-slate-400 font-mono pl-4">app.followpilot.com/dashboard</span>
          </div>

          <div className="p-8 space-y-6 bg-[#0B0C10]">
            <div className="bg-[#12151E] border border-[#222838] rounded-md p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                  Live Action Center Demo
                </span>
                <h3 className="text-lg font-bold text-white">
                  Acme Technologies • 87 / 100 Priority Score
                </h3>
                <p className="text-xs text-slate-400">
                  Requested pricing 24 hours ago. Viewed proposal document yesterday.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-md flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Copilot Generator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 space-y-12 bg-[#0B0C10] border-t border-[#1E2332]">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            The Core Follow-up Engine Loop
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From lead ingestion to contextual email delivery, FollowPilot optimizes for meaningful action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-[#12151E] border border-[#1E2332] rounded-md p-6 space-y-3">
            <div className="w-8 h-8 rounded-md bg-indigo-950/60 flex items-center justify-center text-indigo-400 font-bold text-xs font-mono">
              01
            </div>
            <h3 className="font-bold text-white text-sm">
              Activity & Signal Ingestion
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Leads and interaction signals (email opens, clicks, replies, proposal views) are automatically captured into a chronological lead timeline.
            </p>
          </div>

          <div className="bg-[#12151E] border border-[#1E2332] rounded-md p-6 space-y-3">
            <div className="w-8 h-8 rounded-md bg-indigo-950/60 flex items-center justify-center text-indigo-400 font-bold text-xs font-mono">
              02
            </div>
            <h3 className="font-bold text-white text-sm">
              Hybrid Scoring & AI Intent
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Deterministic signals combined with OpenAI structured context analysis determine buyer intent and rank leads on a 0-100 score engine.
            </p>
          </div>

          <div className="bg-[#12151E] border border-[#1E2332] rounded-md p-6 space-y-3">
            <div className="w-8 h-8 rounded-md bg-indigo-950/60 flex items-center justify-center text-indigo-400 font-bold text-xs font-mono">
              03
            </div>
            <h3 className="font-bold text-white text-sm">
              Human-in-the-Loop Review
            </h3>
            <p className="text-slate-400 leading-relaxed">
              AI generates tailored follow-up drafts. You review, customize if needed, and dispatch emails via Resend with guaranteed delivery tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Transparent Pricing for Growing Teams
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Start for free and scale as your lead pipeline grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* FREE */}
          <div className="bg-[#12151E] border border-[#1E2332] hover:border-indigo-500/40 rounded-md p-6 space-y-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/5 group">
            <h4 className="font-bold text-white text-sm font-mono group-hover:text-indigo-300 transition-colors">FREE</h4>
            <div className="text-3xl font-extrabold text-white font-mono">₹0</div>
            <p className="text-slate-400">For freelancers starting out.</p>
            <Link
              href="/sign-up"
              className="block text-center w-full py-2 bg-[#181C28] hover:bg-indigo-600 hover:text-white border border-[#222838] hover:border-indigo-500 font-semibold rounded-md text-slate-200 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* PRO */}
          <div className="bg-[#12151E] border-2 border-indigo-600 hover:border-indigo-500 rounded-md p-6 space-y-4 shadow-lg shadow-indigo-600/10 relative transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 group">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold px-3 py-0.5 rounded-full text-[10px] uppercase font-mono shadow-xs">
              Most Popular
            </span>
            <h4 className="font-bold text-white text-sm font-mono group-hover:text-indigo-300 transition-colors">PRO</h4>
            <div className="text-3xl font-extrabold text-indigo-400 font-mono">
              ₹999 <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>
            <p className="text-slate-400">For active agencies & sales pros.</p>
            <Link
              href="/sign-up"
              className="block text-center w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-md shadow-md hover:shadow-indigo-500/30 transition-all duration-200"
            >
              Start Pro Trial
            </Link>
          </div>

          {/* BUSINESS */}
          <div className="bg-[#12151E] border border-[#1E2332] hover:border-indigo-500/40 rounded-md p-6 space-y-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/5 group">
            <h4 className="font-bold text-white text-sm font-mono group-hover:text-indigo-300 transition-colors">BUSINESS</h4>
            <div className="text-3xl font-extrabold text-white font-mono">
              ₹5,999 <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>
            <p className="text-slate-400">For high-volume B2B sales teams.</p>
            <Link
              href="/sign-up"
              className="block text-center w-full py-2 bg-slate-800 hover:bg-indigo-600 hover:text-white font-semibold rounded-md text-white border border-slate-700 hover:border-indigo-500 transition-all duration-200"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E2332] max-w-7xl mx-auto px-6 py-8 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0C10]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white">FollowPilot</span>
          <span>© 2026 FollowPilot Inc. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/leads" className="hover:underline">Leads</Link>
          <Link href="/settings" className="hover:underline">Settings</Link>
        </div>
      </footer>
    </div>
  );
}
