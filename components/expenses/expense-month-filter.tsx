"use client";

import { useRouter } from "next/navigation";
import type { ExpenseMonthOption } from "@/lib/expenses";

type ExpenseMonthFilterProps = {
  options: ExpenseMonthOption[];
  selectedMonth?: string;
};

export function ExpenseMonthFilter({
  options,
  selectedMonth,
}: ExpenseMonthFilterProps) {
  const router = useRouter();

  function handleChange(value: string) {
    if (value) {
      router.push(`/expenses?month=${value}`);
      return;
    }

    router.push("/expenses");
  }

  return (
    <select
      value={selectedMonth || ""}
      onChange={(event) => handleChange(event.target.value)}
      className="h-11 rounded-[1rem] border border-black/10 bg-zinc-50 px-4 text-sm text-black outline-none"
    >
      <option value="">All months</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
