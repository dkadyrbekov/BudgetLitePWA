"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ExpenseList } from "@/components/expense-list";
import { SummaryCard } from "@/components/summary-card";
import {
  formatMonthLabel,
  getLatestExpenseDate,
  getMonthKey,
  getTodayDate,
  getWeekStartDate,
  parseMonthFromDate,
  shiftMonth,
} from "@/lib/date";
import { useBudgetData } from "@/hooks/use-budget-data";

type ExpenseDraft = {
  amount: string;
  categoryId: string;
  comment: string;
};

const EMPTY_DRAFT: ExpenseDraft = {
  amount: "",
  categoryId: "",
  comment: "",
};

const FALLBACK_MONTH = new Date(2026, 2, 1);

export function ExpensesManager() {
  const { categories, createExpense, error, expenses, loading } = useBudgetData();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ExpenseDraft>(EMPTY_DRAFT);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const latestExpenseDate = getLatestExpenseDate(expenses);
  const activeMonth = selectedMonth ??
    (latestExpenseDate ? parseMonthFromDate(latestExpenseDate) : FALLBACK_MONTH);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    amountInputRef.current?.focus();
  }, [isOpen]);

  const amountValue = Number(draft.amount);
  const selectedCategory = categories.find(
    (category) => category.id === draft.categoryId,
  );
  const canSave = amountValue > 0 && Boolean(selectedCategory);

  const totals = useMemo(() => {
    const today = getTodayDate();
    const weekStart = getWeekStartDate();

    return expenses.reduce(
      (accumulator, expense) => {
        if (expense.date === today) {
          accumulator.today += expense.amount;
        }

        if (expense.date >= weekStart && expense.date <= today) {
          accumulator.week += expense.amount;
        }

        return accumulator;
      },
      { today: 0, week: 0 },
    );
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const monthKey = getMonthKey(activeMonth);

    return [...expenses].filter((expense) => expense.date.startsWith(monthKey));
  }, [activeMonth, expenses]);

  function openSheet() {
    setIsOpen(true);
  }

  function closeSheet() {
    setIsOpen(false);
    setDraft(EMPTY_DRAFT);
  }

  async function saveExpense() {
    if (!selectedCategory || !canSave || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await createExpense({
        amount: amountValue,
        categoryId: selectedCategory.id,
        comment: draft.comment.trim(),
      });

      closeSheet();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {error ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Today"
          value={`$${totals.today.toFixed(2)}`}
          tone="dark"
        />
        <SummaryCard
          label="This week"
          value={`$${totals.week.toFixed(2)}`}
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
          <p className="text-sm text-slate-500">Loading expenses...</p>
        </section>
      ) : (
        <ExpenseList
          items={filteredExpenses}
          onEmptyAction={openSheet}
          emptyActionLabel="Add expense"
        />
      )}

      <button
        type="button"
        onClick={openSheet}
        className="fixed bottom-24 right-4 z-20 flex h-14 items-center justify-center rounded-full bg-emerald-400 px-5 text-base font-semibold text-slate-950 shadow-[0_18px_40px_rgba(16,185,129,0.35)] transition hover:bg-emerald-300 sm:right-[max(1rem,calc(50%-14rem))]"
      >
        Add Expense
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-30 bg-slate-950/30">
          <button
            type="button"
            aria-label="Close add expense"
            onClick={closeSheet}
            className="absolute inset-0"
          />

          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-[32px] bg-white px-4 pb-8 pt-4 shadow-[0_-24px_60px_rgba(15,23,42,0.24)]">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">New expense</p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  Add in seconds
                </h2>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-5 rounded-[28px] bg-slate-950 px-4 py-5 text-white">
              <label
                htmlFor="expense-amount"
                className="text-xs uppercase tracking-[0.2em] text-slate-400"
              >
                Amount
              </label>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl text-slate-400">$</span>
                <input
                  id="expense-amount"
                  ref={amountInputRef}
                  type="text"
                  inputMode="decimal"
                  value={draft.amount}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      amount: event.target.value.replace(/[^0-9.]/g, ""),
                    }))
                  }
                  placeholder="0.00"
                  className="w-full border-0 bg-transparent p-0 text-5xl font-semibold tracking-tight outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Category
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const isSelected = draft.categoryId === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          categoryId: category.id,
                        }))
                      }
                      className={`rounded-[28px] px-3 py-4 text-center transition ${
                        isSelected
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-950"
                      }`}
                    >
                      <span className="block text-4xl">{category.icon}</span>
                      <span className="mt-3 block text-sm font-medium">
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-4 block">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Comment
              </span>
              <input
                type="text"
                value={draft.comment}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    comment: event.target.value,
                  }))
                }
                placeholder="Optional note"
                className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-950 outline-none placeholder:text-slate-400"
              />
            </label>

            <button
              type="button"
              onClick={() => void saveExpense()}
              disabled={!canSave || isSaving}
              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-4 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {isSaving ? "Saving..." : "Save expense"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
