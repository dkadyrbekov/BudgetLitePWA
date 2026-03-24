import { createServerSupabaseClient } from "@/lib/supabase/server";

export type IncomeListItem = {
  id: string;
  amount: number;
  description: string | null;
  income_date: string;
};

export async function getIncomeList(limit = 20): Promise<IncomeListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incomes")
    .select("id, amount, description, income_date")
    .order("income_date", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}
