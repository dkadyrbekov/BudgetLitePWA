"use client";

import { useMemo, useState } from "react";

import { SummaryCard } from "@/components/summary-card";
import {
  formatMonthLabel,
  getLatestExpenseDate,
  getMonthKey,
  parseMonthFromDate,
  shiftMonth,
} from "@/lib/date";
import { useBudgetData } from "@/hooks/use-budget-data";

type CategoryStat = {
  id: string;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  color: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  food: "#0f172a",
  transport: "#0f766e",
  groceries: "#16a34a",
  fun: "#f97316",
  bills: "#dc2626",
  health: "#7c3aed",
};

const FALLBACK_MONTH = new Date(2026, 2, 1);

function buildDonutSegments(stats: CategoryStat[]) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return stats.map((stat) => {
    const length = (stat.percentage / 100) * circumference;
    const segment = {
      ...stat,
      radius,
      circumference,
      length,
      offset,
    };

    offset -= length;

    return segment;
  });
}

export function StatsManager() {
  const { categories, expenses, loading } = useBudgetData();
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const latestExpenseDate = getLatestExpenseDate(expenses);
  const activeMonth = selectedMonth ??
    (latestExpenseDate ? parseMonthFromDate(latestExpenseDate) : FALLBACK_MONTH);

  const monthKey = getMonthKey(activeMonth);

  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(monthKey)),
    [expenses, monthKey],
  );

  const totalExpenses = useMemo(
    () =>
      monthlyExpenses.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
    [monthlyExpenses],
  );

  const categoryStats = useMemo(() => {
    if (totalExpenses === 0) {
      return [];
    }

    return categories
      .map((category) => {
        const amount = monthlyExpenses
          .filter((expense) => expense.categoryId === category.id)
          .reduce((total, expense) => total + expense.amount, 0);

        if (amount === 0) {
          return null;
        }

        return {
          id: category.id,
          name: category.name,
          icon: category.icon,
          amount,
          percentage: (amount / totalExpenses) * 100,
          color: CATEGORY_COLORS[category.id] ?? "#475569",
        };
      })
      .filter((stat): stat is CategoryStat => stat !== null)
      .sort((a, b) => b.amount - a.amount);
  }, [categories, monthlyExpenses, totalExpenses]);

  const donutSegments = useMemo(
    () => buildDonutSegments(categoryStats),
    [categoryStats],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="This month"
          value={`$${totalExpenses.toFixed(2)}`}
          tone="dark"
        />
        <SummaryCard
          label="Categories"
          value={String(categoryStats.length)}
          tone="light"
        />
      </div>

      <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedMonth(shiftMonth(activeMonth, -1))}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Prev
          </button>

          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Selected month
            </p>
            <h2 className="text-lg font-semibold text-slate-950">
              {formatMonthLabel(activeMonth)}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMonth(shiftMonth(activeMonth, 1))}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Next
          </button>
        </div>
      </section>

      {loading ? (
        <section className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Loading stats...</p>
        </section>
      ) : categoryStats.length === 0 ? (
        <section className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <p className="text-lg font-semibold text-slate-900">No data yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            There are no expenses in {formatMonthLabel(activeMonth)}.
          </p>
        </section>
      ) : (
        <>
          <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="mx-auto flex w-full max-w-xs flex-col items-center">
              <div className="relative h-52 w-52">
                <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="18"
                  />

                  {donutSegments.map((segment) => (
                    <circle
                      key={segment.id}
                      cx="70"
                      cy="70"
                      r={segment.radius}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="18"
                      strokeDasharray={`${segment.length} ${segment.circumference}`}
                      strokeDashoffset={segment.offset}
                      strokeLinecap="butt"
                    />
                  ))}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-3xl font-semibold tracking-tight text-slate-950">
                    ${totalExpenses.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="space-y-3">
              {categoryStats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex items-center justify-between rounded-[28px] bg-slate-50 px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-3xl"
                      style={{ backgroundColor: `${stat.color}18` }}
                    >
                      {stat.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{stat.name}</p>
                      <p className="text-sm text-slate-500">
                        {stat.percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <p className="text-base font-semibold text-slate-950">
                    ${stat.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
