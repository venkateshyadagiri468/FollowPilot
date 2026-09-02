"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  MessageSquare,
  BarChart3,
  Settings,
  UploadCloud,
  Zap,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/modules/store/app-context";

export function Sidebar() {
  const pathname = usePathname();
  const { usage } = useApp();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
    { href: "/followups", label: "Follow-ups", icon: Clock },
    { href: "/conversations", label: "Inbox", icon: MessageSquare },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const leadPercentage = Math.min(100, Math.round((usage.leadsCount / usage.leadsLimit) * 100));

  return (
    <aside className="w-56 shrink-0 bg-white dark:bg-[#12151C] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base">
              FollowPilot
            </span>
          </Link>
        </div>

        {/* Quick CSV Import Action */}
        <div className="p-3">
          <Link
            href="/leads/import"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 space-y-0.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Plan & Usage Widget Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            {usage.plan} Plan
          </span>
          <span className="text-[11px] text-slate-500">
            {usage.leadsCount} / {usage.leadsLimit}
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${leadPercentage}%` }}
          />
        </div>

        <Link
          href="/settings"
          className="block text-center text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          Manage plan & usage
        </Link>
      </div>
    </aside>
  );
}
