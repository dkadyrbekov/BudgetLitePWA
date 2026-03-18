"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/expenses", label: "Expenses" },
  { href: "/stats", label: "Stats" },
  { href: "/categories", label: "Categories" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md px-4 pb-4">
      <div className="flex items-center justify-between rounded-[28px] border border-white/80 bg-slate-950 px-2 py-2 shadow-[0_20px_50px_rgba(15,23,42,0.28)]">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-1 items-center justify-center rounded-full px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
