import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ExpenseCategoryOption = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export type ExpenseListItem = {
  id: string;
  amount: number;
  category_id: string | null;
  category_name_snapshot: string;
  category_icon_snapshot: string | null;
  description: string | null;
  expense_date: string;
};

export type ExpenseMonthOption = {
  value: string;
  label: string;
};

export async function getExpenseCategories(): Promise<ExpenseCategoryOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon, color")
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getExpenseList(limit = 30): Promise<ExpenseListItem[]> {
  return getFilteredExpenseList({ limit });
}

export async function getFilteredExpenseList({
  month,
  limit = 100,
}: {
  month?: string;
  limit?: number;
} = {}): Promise<ExpenseListItem[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("expenses")
    .select(
      "id, amount, category_id, category_name_snapshot, category_icon_snapshot, description, expense_date",
    )
    .order("expense_date", { ascending: false })
    .limit(limit);

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const startDate = `${month}-01`;
    const nextMonth = getNextMonth(month);

    query = query.gte("expense_date", startDate).lt("expense_date", nextMonth);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getExpenseMonthOptions(): Promise<ExpenseMonthOption[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("expense_date")
    .order("expense_date", { ascending: false })
    .limit(200);

  if (error || !data) {
    return [];
  }

  const uniqueMonths = Array.from(
    new Set(data.map((expense) => expense.expense_date.slice(0, 7))),
  );

  return uniqueMonths.map((month) => ({
    value: month,
    label: formatMonth(month),
  }));
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
