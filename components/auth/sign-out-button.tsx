"use client";

import { useEffect, useState, useTransition } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      window.location.assign("/login");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing out..." : "Sign out"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center sm:justify-center">
          <button
            type="button"
            aria-label="Close sign out confirmation"
            className="absolute inset-0"
            onClick={() => {
              if (!isPending) {
                setIsOpen(false);
              }
            }}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-out-title"
            className="relative z-10 w-full rounded-t-[2rem] bg-white px-4 pb-5 pt-3 shadow-2xl sm:max-w-sm sm:rounded-[2rem]"
          >
            <div className="mx-auto h-1.5 w-14 rounded-full bg-black/10 sm:hidden" />

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Session
              </p>
              <h2
                id="sign-out-title"
                className="mt-2 text-2xl font-semibold tracking-tight text-black"
              >
                Sign out?
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                You will need a new magic link to access the app again.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex h-12 items-center justify-center rounded-[1.25rem] border border-black/10 bg-white text-sm font-medium text-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isPending}
                className="flex h-12 items-center justify-center rounded-[1.25rem] bg-black text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
