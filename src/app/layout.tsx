import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FollowPilot — AI-Assisted B2B Sales Follow-up Monolith",
  description: "Never let a valuable lead go cold. Intelligent lead scoring, activity tracking, and contextual AI outreach.",
};

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_dummy_key_for_build";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className={`${inter.className} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#FAF9F6] dark:bg-[#0F1115] text-slate-900 dark:text-slate-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
