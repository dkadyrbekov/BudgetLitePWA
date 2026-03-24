"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteIncome } from "@/lib/actions/incomes";

export function DeleteIncomeButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm("Delete this income entry?");

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteIncome(id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-full border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error ? <p className="text-[11px] text-rose-700">{error}</p> : null}
    </div>
  );
}
