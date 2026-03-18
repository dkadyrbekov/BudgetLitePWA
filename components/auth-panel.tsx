"use client";

import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";

export function AuthPanel() {
  const { error, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return;
    }

    setIsSubmitting(true);
    setSent(false);

    try {
      await signInWithEmail(trimmedEmail);
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center">
      <section className="w-full rounded-[32px] bg-slate-950 p-5 text-white shadow-[0_20px_45px_rgba(15,23,42,0.24)]">
        <p className="text-sm font-medium text-slate-300">Sign in</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Continue with email
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          We&apos;ll send a magic link so you can open your budget without a password.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-3xl bg-white/8 px-4 py-4 text-base outline-none placeholder:text-slate-500"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-4 py-4 text-base font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {sent ? (
          <p className="mt-4 text-sm text-emerald-300">
            Check your email for the sign-in link.
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm text-rose-300">{error}</p>
        ) : null}
      </section>
    </div>
  );
}
