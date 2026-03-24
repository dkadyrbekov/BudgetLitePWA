import Link from "next/link";
import { redirect } from "next/navigation";
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
      <header className="border-b border-black/10 bg-white px-4 py-4">
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

      <div className="flex-1 px-4 py-6">{children}</div>

      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-black/10 bg-white">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-2 py-3 text-center text-xs font-medium text-zinc-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
