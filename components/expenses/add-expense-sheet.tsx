"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";
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
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(getTodayDate());
  const [showDetails, setShowDetails] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function loadFormValues() {
    setAmount(expense ? String(expense.amount) : "");
    setCategoryId(expense?.category_id ?? "");
    setDescription(expense?.description ?? "");
    setExpenseDate(expense?.expense_date ?? getTodayDate());
    setShowDetails(mode === "edit");
    setError(null);
  }

  function openSheet() {
    loadFormValues();
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

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (!categoryId.trim()) {
      setError("Choose a category.");
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

  const canSave =
    Number.isFinite(Number(amount)) &&
    Number(amount) > 0 &&
    categoryId.trim().length > 0 &&
    categories.length > 0;

  return (
    <>
      <button type="button" onClick={openSheet} className={triggerClassName}>
        {triggerLabel}
      </button>

      {typeof document !== "undefined" && isOpen
        ? createPortal(
            <div className="fixed inset-0 z-[100] bg-black/40">
              <div className="absolute inset-0" onClick={closeSheet} />

              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="absolute inset-x-0 bottom-0 z-[101] flex h-[90dvh] flex-col overflow-hidden rounded-t-[2rem] bg-[var(--background)] shadow-2xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-[min(44rem,90dvh)] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[2rem]"
              >
                <div className="border-b border-black/10 px-4 pb-4 pt-3">
                  <div className="mx-auto h-1.5 w-14 rounded-full bg-black/10 sm:hidden" />

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                        Fast entry
                      </p>
                      <h2
                        id={titleId}
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
                </div>

                <form
                  className="flex min-h-0 flex-1 flex-col"
                  onSubmit={handleSubmit}
                >
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                    <div className="space-y-4">
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
                          autoFocus
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
                                  {category.icon ||
                                    category.name.slice(0, 1).toUpperCase()}
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
                              <span className="text-sm text-zinc-600">
                                Description
                              </span>
                              <input
                                type="text"
                                value={description}
                                onChange={(event) =>
                                  setDescription(event.target.value)
                                }
                                placeholder="Optional note"
                                className="h-12 w-full rounded-2xl border border-black/10 bg-zinc-50 px-4 text-sm text-black outline-none transition focus:border-black/30"
                              />
                            </label>

                            <label className="block space-y-2">
                              <span className="text-sm text-zinc-600">Date</span>
                              <input
                                type="date"
                                value={expenseDate}
                                onChange={(event) =>
                                  setExpenseDate(event.target.value)
                                }
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
                  </div>

                  <div className="border-t border-black/10 bg-[var(--background)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
                    <button
                      type="submit"
                      disabled={!canSave || isPending}
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
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
