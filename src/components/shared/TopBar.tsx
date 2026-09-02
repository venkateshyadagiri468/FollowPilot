"use client";

import React, { useState } from "react";
import { useApp } from "@/modules/store/app-context";
import { UserButton, useUser } from "@clerk/nextjs";
import { Building2, Plus, RefreshCw, ChevronDown, Check } from "lucide-react";
import { NewLeadModal } from "../domain/NewLeadModal";

export function TopBar() {
  const { org, user, resetToSeedData } = useApp();
  const { user: clerkUser, isLoaded } = useUser();
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  const displayName = isLoaded && clerkUser ? clerkUser.fullName || clerkUser.firstName || user.name : user.name;

  return (
    <>
      <header className="h-14 bg-white dark:bg-[#12151C] border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Organization Selector */}
        <div className="relative">
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{org.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400">
                Organizations
              </div>
              <button
                onClick={() => setIsOrgDropdownOpen(false)}
                className="w-full text-left px-3 py-2 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium"
              >
                <span className="truncate">{org.name}</span>
                <Check className="w-3.5 h-3.5 text-indigo-600" />
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <button
                onClick={() => {
                  setIsOrgDropdownOpen(false);
                  alert("Organization creation modal");
                }}
                className="w-full text-left px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                + Create Organization
              </button>
            </div>
          )}
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-3">
          {/* Reset Demo Data Button */}
          <button
            onClick={resetToSeedData}
            title="Reset database to demo seed data"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Quick Add Lead */}
          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden md:inline">
              {displayName}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* New Lead Modal */}
      {isNewLeadOpen && <NewLeadModal onClose={() => setIsNewLeadOpen(false)} />}
    </>
  );
}
