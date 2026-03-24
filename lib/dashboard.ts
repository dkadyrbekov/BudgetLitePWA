import { createServerSupabaseClient } from "@/lib/supabase/server";

type DashboardTotals = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthBalance: number;
};

type RecentTransaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  type: "income" | "expense";
};

export type DashboardData = DashboardTotals & {
  recentTransactions: RecentTransaction[];
  hasData: boolean;
};

type AmountRow = {
  amount: number;
};

type ExpensePreviewRow = {
  id: string;
  amount: number;
  category_name_snapshot: string;
  description: string | null;
  expense_date: string;
};

type IncomePreviewRow = {
  id: string;
  amount: number;
  description: string | null;
  income_date: string;
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient();
  const monthRange = getCurrentMonthRange();

  const [
    allExpensesResult,
    allIncomesResult,
    monthExpensesResult,
    monthIncomesResult,
    recentExpensesResult,
    recentIncomesResult,
  ] = await Promise.all([
    supabase.from("expenses").select("amount"),
    supabase.from("incomes").select("amount"),
    supabase
      .from("expenses")
      .select("amount")
      .gte("expense_date", monthRange.start)
      .lt("expense_date", monthRange.end),
    supabase
      .from("incomes")
      .select("amount")
      .gte("income_date", monthRange.start)
      .lt("income_date", monthRange.end),
    supabase
      .from("expenses")
      .select("id, amount, category_name_snapshot, description, expense_date")
      .order("expense_date", { ascending: false })
      .limit(4),
    supabase
      .from("incomes")
      .select("id, amount, description, income_date")
      .order("income_date", { ascending: false })
      .limit(4),
  ]);

  const hasQueryError = [
    allExpensesResult,
    allIncomesResult,
    monthExpensesResult,
    monthIncomesResult,
    recentExpensesResult,
    recentIncomesResult,
  ].some((result) => result.error);

  if (hasQueryError) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      currentMonthIncome: 0,
      currentMonthExpenses: 0,
      currentMonthBalance: 0,
      recentTransactions: [],
      hasData: false,
    };
  }

  const totalIncome = sumAmounts(allIncomesResult.data ?? []);
  const totalExpenses = sumAmounts(allExpensesResult.data ?? []);
  const currentMonthIncome = sumAmounts(monthIncomesResult.data ?? []);
  const currentMonthExpenses = sumAmounts(monthExpensesResult.data ?? []);

  const recentTransactions = [
    ...((recentExpensesResult.data ?? []) as ExpensePreviewRow[]).map((expense) => ({
      id: expense.id,
      title: expense.description || expense.category_name_snapshot,
      subtitle: expense.description ? expense.category_name_snapshot : "Expense",
      amount: expense.amount,
      date: expense.expense_date,
      type: "expense" as const,
    })),
    ...((recentIncomesResult.data ?? []) as IncomePreviewRow[]).map((income) => ({
      id: income.id,
      title: income.description || "Income",
      subtitle: "Income",
      amount: income.amount,
      date: income.income_date,
      type: "income" as const,
    })),
  ]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    currentMonthIncome,
    currentMonthExpenses,
    currentMonthBalance: currentMonthIncome - currentMonthExpenses,
    recentTransactions,
    hasData: totalIncome > 0 || totalExpenses > 0 || recentTransactions.length > 0,
  };
}

function sumAmounts(rows: AmountRow[]) {
  return rows.reduce((total, row) => total + Number(row.amount), 0);
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

