"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppNavProps = {
  items: Array<{
    href: string;
    label: string;
  }>;
};

export function AppNav({ items }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 grid grid-cols-4 border-t border-black/10 bg-white/95 backdrop-blur">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-2 py-3 text-center text-xs font-medium transition ${
              isActive ? "text-black" : "text-zinc-500"
            }`}
          >
            <span
              className={`mx-auto block h-1 w-8 rounded-full ${
                isActive ? "bg-black" : "bg-transparent"
              }`}
            />
            <span className="mt-2 block">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
