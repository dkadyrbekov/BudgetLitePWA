import { StatsMonthFilter } from "@/components/stats/stats-month-filter";
import { getMonthlyStatsData } from "@/lib/stats";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

type StatsPageProps = {
  searchParams: Promise<{
    month?: string | string[];
  }>;
};

export default async function StatsPage({ searchParams }: StatsPageProps) {
  const query = await searchParams;
  const selectedMonth =
    typeof query.month === "string" ? query.month : undefined;
  const stats = await getMonthlyStatsData(selectedMonth);

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Selected month
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
              Monthly stats
            </h2>
          </div>
          <p className="text-right text-sm text-zinc-500">
            {stats.hasExpenses ? `${stats.categories.length} categories` : "No expenses"}
          </p>
        </div>

        <div className="mt-4">
          <StatsMonthFilter
            options={stats.monthOptions}
            selectedMonth={stats.month}
          />
        </div>

        {stats.hasExpenses ? (
          <div className="mt-6 flex justify-center">
            <DonutChart categories={stats.categories} total={stats.totalExpenses} />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-zinc-50 px-4 py-5 text-center">
            <p className="text-sm font-medium text-black">
              No expenses for {stats.monthLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Add expenses in this month to see the chart and category
              breakdown.
            </p>
          </div>
        )}
      </section>

      {stats.hasExpenses ? (
        <>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Monthly expenses"
              value={currencyFormatter.format(stats.totalExpenses)}
              tone="rose"
            />
            <SummaryCard
              label="Monthly income"
              value={currencyFormatter.format(stats.totalIncome)}
              tone="emerald"
            />
            <SummaryCard
              label="Net balance"
              value={currencyFormatter.format(stats.netBalance)}
              tone="neutral"
            />
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                Breakdown
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-black">
                Category totals
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {stats.categories.map((category) => (
                <article
                  key={`${category.icon ?? ""}-${category.name}`}
                  className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                    style={{ backgroundColor: `${category.color}22` }}
                  >
                    {category.icon || category.name.slice(0, 1).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-black">
                      {category.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {category.percentage.toFixed(1)}% of monthly expenses
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-black">
                      {currencyFormatter.format(category.amount)}
                    </p>
                    <div className="mt-2 h-2 w-18 overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(category.percentage, 6)}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "rose" | "emerald" | "neutral";
}) {
  const valueClassName =
    tone === "rose"
      ? "text-rose-700"
      : tone === "emerald"
        ? "text-emerald-700"
        : "text-black";

  return (
    <section className="rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-3 text-xl font-semibold tracking-tight ${valueClassName}`}>
        {value}
      </p>
    </section>
  );
}

function DonutChart({
  categories,
  total,
}: {
  categories: Awaited<ReturnType<typeof getMonthlyStatsData>>["categories"];
  total: number;
}) {
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  const segments = categories.reduce<
    Array<{
      key: string;
      color: string;
      dashArray: string;
      dashOffset: number;
    }>
  >((items, category) => {
    const previousOffset =
      items.length > 0
        ? Math.abs(items[items.length - 1].dashOffset) +
          Number(items[items.length - 1].dashArray.split(" ")[0])
        : 0;
    const segmentLength = (category.amount / total) * circumference;

    items.push({
      key: `${category.icon ?? ""}-${category.name}`,
      color: category.color,
      dashArray: `${segmentLength} ${circumference - segmentLength}`,
      dashOffset: -previousOffset,
    });

    return items;
  }, []);

  return (
    <div className="relative flex h-56 w-56 items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className="-rotate-90"
        aria-label="Monthly expense breakdown donut chart"
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#ece7df"
          strokeWidth={strokeWidth}
        />
        {segments.map((segment) => (
          <circle
            key={segment.key}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
          />
        ))}
      </svg>

      <div className="absolute text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Expenses
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-black">
          {currencyFormatter.format(total)}
        </p>
      </div>
    </div>
  );
}
