import React from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Zap, ArrowRight, Mail, User, Lock } from "lucide-react";

export default function SignUpPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidClerkKey = clerkKey && clerkKey.startsWith("pk_") && !clerkKey.includes("followpilot-demo");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF9F6] dark:bg-[#0F1115]">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:bg-indigo-700 transition-colors">
            <Zap className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white tracking-tight text-xl">
            FollowPilot
          </span>
        </Link>
      </div>

      {isValidClerkKey ? (
        <div className="w-full max-w-md flex justify-center">
          <SignUp
            appearance={{
              elements: {
                card: "shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl",
                primaryButton: "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5",
                footerActionLink: "text-indigo-600 hover:underline font-semibold",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      ) : (
        /* Fallback Sign Up Card */
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Create your FollowPilot account
            </h2>
            <p className="text-xs text-slate-500">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <form action="/dashboard" method="GET" className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  defaultValue="Venkatesh"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  defaultValue="sales@followpilot.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors text-xs"
            >
              <span>Create Account & Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
            <p className="text-[11px] text-slate-500">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-indigo-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
