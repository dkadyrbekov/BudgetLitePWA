"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AuthPanel } from "@/components/auth-panel";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";

type AppShellProps = {
  children: ReactNode;
};

const TITLES: Record<string, string> = {
  "/expenses": "Budget Lite",
  "/stats": "Stats",
  "/categories": "Categories",
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Budget Lite";
  const { loading, signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(241,245,249,0.8)_42%,_#e2e8f0_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Personal budget
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-full border border-white/70 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur"
            >
              Sign out
            </button>
          ) : null}
        </header>

        <main className="flex-1">
          {loading ? (
            <section className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <p className="text-sm text-slate-500">Loading...</p>
            </section>
          ) : user ? (
            children
          ) : (
            <AuthPanel />
          )}
        </main>

        {user ? <BottomNav /> : null}
      </div>
    </div>
  );
}
