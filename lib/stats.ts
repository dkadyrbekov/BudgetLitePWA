import {
  getExpenseMonthOptions,
  getFilteredExpenseList,
  type ExpenseMonthOption,
} from "@/lib/expenses";
import { getIncomeList } from "@/lib/incomes";

export type CategoryStat = {
  icon: string | null;
  name: string;
  amount: number;
  percentage: number;
  color: string;
};

export type MonthlyStatsData = {
  month: string;
  monthLabel: string;
  monthOptions: ExpenseMonthOption[];
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  categories: CategoryStat[];
  hasExpenses: boolean;
};

const CHART_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#78716c",
];

export async function getMonthlyStatsData(
  selectedMonth?: string,
): Promise<MonthlyStatsData> {
  const monthOptions = await getExpenseMonthOptions();
  const month = resolveMonth(selectedMonth, monthOptions);
  const monthLabel = formatMonth(month);

  const [expenses, incomes] = await Promise.all([
    getFilteredExpenseList({ month, limit: 500 }),
    getMonthlyIncomeList(month),
  ]);

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );
  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);

  const grouped = new Map<
    string,
    {
      icon: string | null;
      name: string;
      amount: number;
    }
  >();

  for (const expense of expenses) {
    const key = `${expense.category_icon_snapshot ?? ""}:${expense.category_name_snapshot}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.amount += Number(expense.amount);
      continue;
    }

    grouped.set(key, {
      icon: expense.category_icon_snapshot,
      name: expense.category_name_snapshot,
      amount: Number(expense.amount),
    });
  }

  const categories = Array.from(grouped.values())
    .sort((left, right) => right.amount - left.amount)
    .map((category, index) => ({
      ...category,
      percentage:
        totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  return {
    month,
    monthLabel,
    monthOptions,
    totalExpenses,
    totalIncome,
    netBalance: totalIncome - totalExpenses,
    categories,
    hasExpenses: totalExpenses > 0,
  };
}

async function getMonthlyIncomeList(month: string) {
  const startDate = `${month}-01`;
  const nextMonth = getNextMonth(month);
  const incomes = await getIncomeList(500);

  return incomes.filter(
    (income) => income.income_date >= startDate && income.income_date < nextMonth,
  );
}

function resolveMonth(month: string | undefined, options: ExpenseMonthOption[]) {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    return month;
  }

  if (options.length > 0) {
    return options[0].value;
  }

  return new Date().toISOString().slice(0, 7);
}

function getNextMonth(month: string) {
  const [year, monthPart] = month.split("-").map(Number);
  const next = new Date(Date.UTC(year, monthPart, 1));

  return next.toISOString().slice(0, 10);
}

function formatMonth(month: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${month}-01T00:00:00`));
}
