import { AddExpenseSheet } from "@/components/expenses/add-expense-sheet";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { ExpenseMonthFilter } from "@/components/expenses/expense-month-filter";
import {
  getExpenseCategories,
  getExpenseMonthOptions,
  getFilteredExpenseList,
} from "@/lib/expenses";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

type ExpensesPageProps = {
  searchParams: Promise<{
    month?: string | string[];
  }>;
};

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const query = await searchParams;
  const selectedMonth =
    typeof query.month === "string" ? query.month : undefined;
  const categories = await getExpenseCategories();
  const [expenses, monthOptions] = await Promise.all([
    getFilteredExpenseList({ month: selectedMonth }),
    getExpenseMonthOptions(),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <div className="space-y-4 pb-32">
        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Expenses
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-black">
              Expense history
            </h2>
            <p className="text-sm leading-6 text-zinc-600">
              Track and update household spending in one place.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                History
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-black">
                Latest expenses
              </h2>
            </div>

            <ExpenseMonthFilter
              options={monthOptions}
              selectedMonth={selectedMonth}
            />
          </div>

          {expenses.length > 0 ? (
            <div className="mt-4 space-y-3">
              {expenses.map((expense) => (
                <article
                  key={expense.id}
                  className="rounded-2xl bg-zinc-50 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-sm font-semibold text-rose-700">
                      {expense.category_icon_snapshot ||
                        expense.category_name_snapshot.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-black">
                            {expense.category_name_snapshot}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {dateFormatter.format(
                              new Date(`${expense.expense_date}T00:00:00`),
                            )}
                          </p>
                        </div>

                        <p className="text-base font-semibold text-rose-700">
                          -{currencyFormatter.format(expense.amount)}
                        </p>
                      </div>

                      {expense.description ? (
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                          {expense.description}
                        </p>
                      ) : null}

                      <div className="mt-3 flex items-center justify-end gap-2">
                        <AddExpenseSheet
                          mode="edit"
                          expense={expense}
                          categories={categories}
                          triggerLabel="Edit"
                          triggerClassName="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-zinc-700 transition"
                        />
                        <DeleteExpenseButton id={expense.id} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-4 text-sm leading-6 text-zinc-600">
              {selectedMonth
                ? "No expenses found for the selected month."
                : "No expenses yet. Use the button below to add the first one."}
            </div>
          )}
        </section>
      </div>

      <div className="pointer-events-none sticky bottom-22 mt-auto -mx-1">
        <div className="pointer-events-auto rounded-[1.75rem] border border-black/10 bg-[color:rgba(245,241,232,0.96)] p-3 shadow-lg shadow-black/10 backdrop-blur">
          <AddExpenseSheet
            categories={categories}
            triggerLabel="Add Expense"
            triggerClassName="flex h-14 w-full items-center justify-center rounded-[1.25rem] bg-rose-600 text-sm font-semibold text-white transition active:scale-[0.99]"
          />
        </div>
      </div>
    </div>
  );
}
