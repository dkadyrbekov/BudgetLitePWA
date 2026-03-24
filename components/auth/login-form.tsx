"use client";

import { useState, useTransition } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const trimmedEmail = email.trim();
  const isValidEmail = /\S+@\S+\.\S+/.test(trimmedEmail);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValidEmail) {
      setError("Enter a valid email address.");
      return;
    }

    startTransition(async () => {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      window.location.assign("/login?sent=1");
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-700">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-base text-black outline-none transition focus:border-black/30"
          placeholder="you@example.com"
        />
      </label>

      <button
        type="submit"
        disabled={isPending || !isValidEmail}
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-black px-4 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Sending link..." : "Send magic link"}
      </button>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
