import { redirect } from "next/navigation";
import { AppNav } from "@/components/app/app-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/lib/supabase/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/categories", label: "Categories" },
  { href: "/stats", label: "Stats" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Budget Lite
            </p>
            <h1 className="mt-1 text-lg font-semibold text-black">
              Personal budget
            </h1>
            <p className="mt-1 text-sm text-zinc-600">{user.email}</p>
          </div>

          <SignOutButton />
        </div>
      </header>

      <div className="flex-1 px-4 py-5">{children}</div>

      <AppNav items={navItems} />
    </div>
  );
}
