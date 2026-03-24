"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createIncome, updateIncome } from "@/lib/actions/incomes";

type IncomeSheetProps = {
  mode: "create" | "edit";
  triggerClassName: string;
  triggerLabel: string;
  income?: {
    id: string;
    amount: number;
    description: string | null;
    income_date: string;
  };
};

export function IncomeSheet({
  mode,
  triggerClassName,
  triggerLabel,
  income,
}: IncomeSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(income ? String(income.amount) : "");
  const [description, setDescription] = useState(income?.description || "");
  const [incomeDate, setIncomeDate] = useState(income?.income_date || getTodayDate());
  const [showDetails, setShowDetails] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSave = useMemo(() => Number(amount) > 0, [amount]);

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
    setAmount(income ? String(income.amount) : "");
    setDescription(income?.description || "");
    setIncomeDate(income?.income_date || getTodayDate());
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
    setDescription("");
    setIncomeDate(getTodayDate());
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
        mode === "edit" && income
          ? await updateIncome({
              id: income.id,
              amount,
              description,
              incomeDate,
            })
          : await createIncome({
              amount,
              description,
              incomeDate,
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
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <button
            type="button"
            aria-label="Close income sheet"
            className="absolute inset-0"
            onClick={closeSheet}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="income-sheet-title"
            className="relative z-10 w-full rounded-t-[2rem] bg-[var(--background)] px-4 pb-5 pt-3 shadow-2xl"
          >
            <div className="mx-auto h-1.5 w-14 rounded-full bg-black/10" />

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Fast entry
                </p>
                <h2
                  id="income-sheet-title"
                  className="mt-2 text-2xl font-semibold tracking-tight text-black"
                >
                  {mode === "edit" ? "Edit Income" : "Add Income"}
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

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
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
                        value={incomeDate}
                        onChange={(event) => setIncomeDate(event.target.value)}
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

              <div className="sticky bottom-0 -mx-4 border-t border-black/10 bg-[var(--background)] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
                <button
                  type="submit"
                  disabled={!canSave || isPending}
                  className="flex h-14 w-full items-center justify-center rounded-[1.25rem] bg-black text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isPending
                    ? "Saving..."
                    : mode === "edit"
                      ? "Save Changes"
                      : "Save Income"}
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
