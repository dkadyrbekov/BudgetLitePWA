"use client";

import { useRouter } from "next/navigation";
import type { ExpenseMonthOption } from "@/lib/expenses";
import { useMemo, useState } from "react";

type StatsMonthFilterProps = {
  options: ExpenseMonthOption[];
  selectedMonth: string;
};

export function StatsMonthFilter({
  options,
  selectedMonth,
}: StatsMonthFilterProps) {
  const router = useRouter();
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === selectedMonth),
    [options, selectedMonth],
  );
  const previousMonth = selectedIndex < options.length - 1 ? options[selectedIndex + 1] : null;
  const nextMonth = selectedIndex > 0 ? options[selectedIndex - 1] : null;

  function handleChange(value: string) {
    router.push(`/stats?month=${value}`);
  }

  function handleSwipeEnd(touchEndX: number) {
    if (touchStartX === null) {
      return;
    }

    const distance = touchEndX - touchStartX;

    if (distance <= -40 && nextMonth) {
      handleChange(nextMonth.value);
      return;
    }

    if (distance >= 40 && previousMonth) {
      handleChange(previousMonth.value);
    }
  }

  return (
    <div
      onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        handleSwipeEnd(event.changedTouches[0]?.clientX ?? touchStartX ?? 0);
        setTouchStartX(null);
      }}
      className="rounded-[1.5rem] bg-zinc-50 px-3 py-2"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => previousMonth && handleChange(previousMonth.value)}
          disabled={!previousMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-black transition disabled:opacity-30"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="min-w-0 text-center">
          <p className="text-lg font-semibold tracking-tight text-black">
            {options[selectedIndex]?.label || selectedMonth}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Swipe left or right</p>
        </div>

        <button
          type="button"
          onClick={() => nextMonth && handleChange(nextMonth.value)}
          disabled={!nextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-black transition disabled:opacity-30"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
    </div>
  );
}
