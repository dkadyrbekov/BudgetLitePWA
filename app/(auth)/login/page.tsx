import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getRequestBaseUrl } from "@/lib/env";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    sent?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const headersList = await headers();
  const baseUrl = getRequestBaseUrl(headersList);
  const query = await searchParams;
  const error =
    typeof query.error === "string"
      ? decodeURIComponent(query.error)
      : undefined;
  const sent = query.sent === "1";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-emerald-600">Budget Lite</p>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Sign in
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            Use a magic link to access your budget from any device.
          </p>
        </div>

        <div className="mt-6">
          <LoginForm redirectTo={`${baseUrl}/auth/callback?next=/dashboard`} />
        </div>

        {sent ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Check your email for the magic link.
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
