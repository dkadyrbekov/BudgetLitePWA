"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type IncomeInput = {
  amount: string;
  description?: string;
  incomeDate?: string;
};

type UpdateIncomeInput = IncomeInput & {
  id: string;
};

type IncomeActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createIncome(
  input: IncomeInput,
): Promise<IncomeActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to add income." };
  }

  const amount = Number(input.amount);
  const description = input.description?.trim() || null;
  const incomeDate = input.incomeDate?.trim() || getTodayDate();

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }

  const { error } = await supabase.from("incomes").insert({
    amount,
    description,
    income_date: incomeDate,
  });

  if (error) {
    return { ok: false, error: "Could not save the income." };
  }

  revalidateDashboard();
  return { ok: true };
}

export async function updateIncome(
  input: UpdateIncomeInput,
): Promise<IncomeActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to update income." };
  }

  const amount = Number(input.amount);
  const description = input.description?.trim() || null;
  const incomeDate = input.incomeDate?.trim() || getTodayDate();

  if (!input.id.trim()) {
    return { ok: false, error: "Income entry was not found." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }

  const { error } = await supabase
    .from("incomes")
    .update({
      amount,
      description,
      income_date: incomeDate,
    })
    .eq("id", input.id);

  if (error) {
    return { ok: false, error: "Could not update the income." };
  }

  revalidateDashboard();
  return { ok: true };
}

export async function deleteIncome(id: string): Promise<IncomeActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to delete income." };
  }

  if (!id.trim()) {
    return { ok: false, error: "Income entry was not found." };
  }

  const { error } = await supabase.from("incomes").delete().eq("id", id);

  if (error) {
    return { ok: false, error: "Could not delete the income." };
  }

  revalidateDashboard();
  return { ok: true };
}

function revalidateDashboard() {
  revalidatePath("/dashboard");
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
