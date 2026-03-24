import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export async function DashboardOverview() {
  const data = await getDashboardData();

  return (
    <div className="flex min-h-full flex-col">
      <div className="space-y-4 pb-32">
        <section className="overflow-hidden rounded-[2rem] bg-[#111111] px-5 py-6 text-white shadow-lg shadow-black/10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
            Balance
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight">
            {formatCurrency(data.balance)}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-xs text-white/60">Total income</p>
              <p className="mt-1 text-base font-medium">
                {formatCurrency(data.totalIncome)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-xs text-white/60">Total expenses</p>
              <p className="mt-1 text-base font-medium">
                {formatCurrency(data.totalExpenses)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Recent
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-black">
                Latest activity
              </h2>
            </div>
          </div>

          {data.recentTransactions.length > 0 ? (
            <div className="mt-4 space-y-3">
              {data.recentTransactions.map((transaction) => (
                <article
                  key={`${transaction.type}-${transaction.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold ${
                      transaction.type === "income"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {transaction.type === "income" ? "IN" : "EX"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-black">
                      {transaction.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {transaction.subtitle} · {formatDate(transaction.date)}
                    </p>
                  </div>

                  <p
                    className={`text-sm font-semibold ${
                      transaction.type === "income"
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-4 text-sm leading-6 text-zinc-600">
              {data.hasData
                ? "Recent transactions will appear here as new entries are added."
                : "No budget data yet. Once incomes and expenses are added, this dashboard becomes the main control center."}
            </div>
          )}
        </section>
      </div>

      <div className="pointer-events-none sticky bottom-20 mt-auto -mx-1">
        <div className="pointer-events-auto grid grid-cols-2 gap-3 rounded-[1.75rem] border border-black/10 bg-[color:rgba(245,241,232,0.96)] p-3 shadow-lg shadow-black/10 backdrop-blur">
          <ActionButton href="/expenses" label="Add Expense" tone="rose" />
          <ActionButton href="/dashboard" label="Add Income" tone="emerald" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "rose" | "emerald";
}) {
  const className =
    tone === "emerald"
      ? "bg-emerald-600 text-white"
      : "bg-rose-600 text-white";

  return (
    <Link
      href={href}
      className={`flex h-14 items-center justify-center rounded-[1.25rem] text-sm font-semibold transition active:scale-[0.99] ${className}`}
    >
      {label}
    </Link>
  );
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}
