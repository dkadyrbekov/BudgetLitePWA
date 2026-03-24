"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import type { ExpenseCategoryOption, ExpenseListItem } from "@/lib/expenses";

type AddExpenseSheetProps = {
  categories: ExpenseCategoryOption[];
  triggerClassName: string;
  triggerLabel: string;
  mode?: "create" | "edit";
  expense?: ExpenseListItem;
};

export function AddExpenseSheet({
  categories,
  triggerClassName,
  triggerLabel,
  mode = "create",
  expense,
}: AddExpenseSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [categoryId, setCategoryId] = useState(expense?.category_id || "");
  const [description, setDescription] = useState(expense?.description || "");
  const [expenseDate, setExpenseDate] = useState(
    expense?.expense_date || getTodayDate(),
  );
  const [showDetails, setShowDetails] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSave = useMemo(() => {
    return Number(amount) > 0 && categoryId.length > 0;
  }, [amount, categoryId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  function openSheet() {
    setAmount(expense ? String(expense.amount) : "");
    setCategoryId(expense?.category_id || "");
    setDescription(expense?.description || "");
    setExpenseDate(expense?.expense_date || getTodayDate());
    setShowDetails(mode === "edit");
    setError(null);
    setIsOpen(true);
  }

  function closeSheet() {
    if (isPending) {
      return;
    }

    setIsOpen(false);
    setError(null);
  }

  function resetForm() {
    setAmount("");
    setCategoryId("");
    setDescription("");
    setExpenseDate(getTodayDate());
    setShowDetails(false);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSave) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result =
        mode === "edit" && expense
          ? await updateExpense({
              id: expense.id,
              amount,
              categoryId,
              description,
              expenseDate,
            })
          : await createExpense({
              amount,
              categoryId,
              description,
              expenseDate,
            });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (mode === "create") {
        resetForm();
      }
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className={triggerClassName} onClick={openSheet}>
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center sm:justify-center sm:p-4">
          <button
            type="button"
            aria-label="Close add expense sheet"
            className="absolute inset-0"
            onClick={closeSheet}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-expense-title"
            className="relative z-10 flex max-h-[calc(100dvh-0.75rem)] w-full flex-col overflow-hidden rounded-t-[2rem] bg-[var(--background)] px-4 pb-5 pt-3 shadow-2xl sm:max-h-[min(100dvh-2rem,56rem)] sm:max-w-lg sm:rounded-[2rem]"
          >
            <div className="mx-auto h-1.5 w-14 rounded-full bg-black/10" />

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Fast entry
                </p>
                <h2
                  id="add-expense-title"
                  className="mt-2 text-2xl font-semibold tracking-tight text-black"
                >
                  {mode === "edit" ? "Edit Expense" : "Add Expense"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeSheet}
                className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-zinc-600"
              >
                Close
              </button>
            </div>

            <form className="mt-5 flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
                <label className="block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                    Amount
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    className="h-16 w-full rounded-[1.75rem] border border-black/10 bg-white px-5 text-3xl font-semibold tracking-tight text-black outline-none transition focus:border-black/30"
                  />
                </label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Category
                    </span>
                    {categories.length === 0 ? (
                      <span className="text-xs text-amber-700">
                        Create categories first
                      </span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => {
                      const isSelected = category.id === categoryId;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setCategoryId(category.id)}
                          className={`flex min-h-14 items-center gap-3 rounded-[1.25rem] border px-4 py-3 text-left transition ${
                            isSelected
                              ? "border-black bg-black text-white"
                              : "border-black/10 bg-white text-black"
                          }`}
                        >
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                            style={{
                              backgroundColor: category.color || "#f4f4f5",
                              color: "#111111",
                            }}
                          >
                            {category.icon || category.name.slice(0, 1).toUpperCase()}
                          </span>
                          <span className="min-w-0 text-sm font-medium">
                            {category.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-black/10 bg-white">
                  <button
                    type="button"
                    onClick={() => setShowDetails((value) => !value)}
                    className="flex w-full items-center justify-between px-4 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-black">
                      Optional details
                    </span>
                    <span className="text-xs text-zinc-500">
                      {showDetails ? "Hide" : "Add"}
                    </span>
                  </button>

                  {showDetails ? (
                    <div className="space-y-4 border-t border-black/10 px-4 py-4">
                      <label className="block space-y-2">
                        <span className="text-sm text-zinc-600">Description</span>
                        <input
                          type="text"
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          placeholder="Optional note"
                          className="h-12 w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 text-sm text-black outline-none transition focus:border-black/30"
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm text-zinc-600">Date</span>
                        <input
                          type="date"
                          value={expenseDate}
                          onChange={(event) => setExpenseDate(event.target.value)}
                          className="h-12 w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 text-sm text-black outline-none transition focus:border-black/30"
                        />
                      </label>
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="-mx-4 border-t border-black/10 bg-[var(--background)] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
                <button
                  type="submit"
                  disabled={!canSave || isPending || categories.length === 0}
                  className="flex h-14 w-full items-center justify-center rounded-[1.25rem] bg-black text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending
                    ? "Saving..."
                    : mode === "edit"
                      ? "Save Changes"
                      : "Save Expense"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
