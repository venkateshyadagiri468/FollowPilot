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
  Building2,
} from "lucide-react";
import { useApp } from "@/modules/store/app-context";

export function Sidebar() {
  const pathname = usePathname();
  const { org, usage } = useApp();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/leads", label: "Leads Workspace", icon: Users },
    { href: "/followups", label: "Follow-ups Due", icon: Clock },
    { href: "/conversations", label: "Inbox Conversations", icon: MessageSquare },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings & Team", icon: Settings },
  ];

  const leadPercentage = Math.min(100, Math.round((usage.leadsCount / usage.leadsLimit) * 100));

  return (
    <aside className="w-60 shrink-0 bg-[#0E1017] border-r border-[#1E2332] flex flex-col justify-between h-screen sticky top-0 z-30 select-none text-slate-200">
      <div>
        {/* Brand & Organization Header */}
        <div className="h-14 px-3.5 border-b border-[#1E2332] flex items-center justify-between bg-[#0B0C10]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-2xs group-hover:bg-indigo-500 transition-colors shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-semibold text-white tracking-tight text-xs leading-none">
                FollowPilot
              </span>
              <span className="text-[11px] text-slate-400 truncate mt-0.5 font-mono flex items-center gap-1">
                <Building2 className="w-2.5 h-2.5 shrink-0" />
                {org.name}
              </span>
            </div>
          </Link>
        </div>

        {/* Quick CSV Import Action */}
        <div className="p-3">
          <Link
            href="/leads/import"
            className="flex items-center justify-center gap-2 w-full px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-800/80 hover:bg-indigo-900/60 transition-all shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import CSV Leads</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? "bg-[#181C28] text-white font-semibold border border-[#262D42]"
                    : "text-slate-400 hover:bg-[#141722] hover:text-white border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-400 rounded-r-full" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Plan & Usage Widget Footer */}
      <div className="p-3.5 border-t border-[#1E2332] bg-[#11141F]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-200 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {usage.plan} Tier
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {usage.leadsCount}/{usage.leadsLimit}
          </span>
        </div>

        <div className="w-full h-1.5 bg-[#1E2434] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${leadPercentage}%` }}
          />
        </div>

        <Link
          href="/settings"
          className="block text-center text-[11px] text-indigo-400 hover:underline font-medium"
        >
          Manage Entitlements
        </Link>
      </div>
    </aside>
  );
}
