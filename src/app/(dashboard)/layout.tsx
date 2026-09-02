"use client";

import React from "react";
import { AppProvider } from "@/modules/store/app-context";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopBar } from "@/components/shared/TopBar";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="min-h-screen flex bg-[#FAF9F6] dark:bg-[#0F1115] text-slate-900 dark:text-slate-100 font-sans antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </AppProvider>
  );
}
