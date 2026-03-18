import type { BudgetExpense } from "@/lib/types";

type ExpenseListProps = {
  items: BudgetExpense[];
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
};

function formatExpenseDate(date: string) {
  const [, month, day] = date.split("-").map(Number);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${monthNames[month - 1]} ${day}`;
}

export function ExpenseList({
  items,
  emptyActionLabel = "Add expense",
  onEmptyAction,
}: ExpenseListProps) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Expenses</h2>
        <span className="text-sm text-slate-500">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-[28px] bg-slate-50 px-4 py-6 text-center">
          <p className="text-lg font-semibold text-slate-900">No expenses yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This month is empty. Add your first expense to get started.
          </p>
          {onEmptyAction ? (
            <button
              type="button"
              onClick={onEmptyAction}
              className="mt-4 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              {emptyActionLabel}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-[28px] bg-slate-50 px-4 py-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm">
                {item.categoryIcon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">
                      {formatExpenseDate(item.date)}
                    </p>
                    {item.comment ? (
                      <p className="truncate text-base font-medium text-slate-900">
                        {item.comment}
                      </p>
                    ) : (
                      <p className="text-base font-medium text-slate-900">
                        {item.categoryName}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 text-lg font-semibold text-slate-950">
                    -${item.amount.toFixed(2)}
                  </p>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {item.categoryName} • {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
