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
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F1115] text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Top Marketing Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">
            FollowPilot
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              >
                Start Free Trial
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1.5"
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Assisted Sales Follow-up Monolithic Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Never let a valuable lead go cold.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          FollowPilot watches your sales activity, identifies leads that need attention, calculates buyer intent, and helps you send the right contextual follow-up at the right time.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isSignedIn ? (
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Start For Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-all"
          >
            See How It Works
          </a>
        </div>

        <div className="pt-4 flex items-center justify-center gap-6 text-slate-400 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Human-in-the-loop email safety
          </span>
        </div>
      </section>

      {/* Interactive Application Preview Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Mock Browser Header */}
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400 font-mono pl-4">app.followpilot.com/dashboard</span>
          </div>

          <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Live Action Center Demo
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Acme Technologies • 87 / 100 Priority Score
                </h3>
                <p className="text-xs text-slate-500">
                  Requested pricing 24 hours ago. Viewed proposal document yesterday.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Copilot Generator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            The Core Follow-up Engine Loop
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            From lead ingestion to contextual email delivery, FollowPilot optimizes for meaningful action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Activity & Signal Ingestion
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Leads and interaction signals (email opens, clicks, replies, proposal views) are automatically captured into a chronological lead timeline.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Hybrid Scoring & AI Intent
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Deterministic signals combined with OpenAI structured context analysis determine buyer intent and rank leads on a 0-100 score engine.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Human-in-the-Loop Review
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              AI generates tailored follow-up drafts. You review, customize if needed, and dispatch emails via Resend with guaranteed delivery tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Transparent Pricing for Growing Teams
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Start for free and scale as your lead pipeline grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* FREE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">FREE</h4>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₹0</div>
            <p className="text-slate-500">For freelancers starting out.</p>
            <Link
              href="/sign-up"
              className="block text-center w-full py-2 bg-slate-100 dark:bg-slate-800 font-semibold rounded-lg text-slate-800 dark:text-slate-200"
            >
              Get Started
            </Link>
          </div>

          {/* PRO */}
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-600 rounded-xl p-6 space-y-4 shadow-lg relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold px-3 py-0.5 rounded-full text-[10px] uppercase">
              Most Popular
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">PRO</h4>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              ₹999 <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>
            <p className="text-slate-500">For active agencies & sales pros.</p>
            <Link
              href="/sign-up"
              className="block text-center w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
            >
              Start Pro Trial
            </Link>
          </div>

          {/* BUSINESS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">BUSINESS</h4>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              ₹5,999 <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>
            <p className="text-slate-500">For high-volume B2B sales teams.</p>
            <Link
              href="/sign-up"
              className="block text-center w-full py-2 bg-slate-900 dark:bg-slate-100 font-semibold rounded-lg text-white dark:text-slate-900"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 max-w-7xl mx-auto px-6 py-8 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-900 dark:text-white">FollowPilot</span>
          <span>© 2026 FollowPilot Inc. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/leads" className="hover:underline font-medium">Leads</Link>
          <Link href="/settings" className="hover:underline font-medium">Settings</Link>
        </div>
      </footer>
    </div>
  );
}
