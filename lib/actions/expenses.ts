"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CreateExpenseInput = {
  amount: string;
  categoryId: string;
  description?: string;
  expenseDate?: string;
};

type UpdateExpenseInput = CreateExpenseInput & {
  id: string;
};

type CreateExpenseResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createExpense(
  input: CreateExpenseInput,
): Promise<CreateExpenseResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to add an expense." };
  }

  const amount = Number(input.amount);
  const categoryId = input.categoryId.trim();
  const description = input.description?.trim() || null;
  const expenseDate = input.expenseDate?.trim() || getTodayDate();

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }

  if (!categoryId) {
    return { ok: false, error: "Choose a category." };
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, icon, color")
    .eq("id", categoryId)
    .single();

  if (categoryError || !category) {
    return {
      ok: false,
      error: categoryError?.message || "Selected category was not found.",
    };
  }

  const { error: insertError } = await supabase.from("expenses").insert({
    amount,
    category_id: category.id,
    category_name_snapshot: category.name,
    category_icon_snapshot: category.icon,
    category_color_snapshot: category.color,
    description,
    expense_date: expenseDate,
  });

  if (insertError) {
    return {
      ok: false,
      error: insertError.message || "Could not save the expense.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/expenses");

  return { ok: true };
}

export async function updateExpense(
  input: UpdateExpenseInput,
): Promise<CreateExpenseResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to update an expense." };
  }

  const expenseId = input.id.trim();
  const amount = Number(input.amount);
  const categoryId = input.categoryId.trim();
  const description = input.description?.trim() || null;
  const expenseDate = input.expenseDate?.trim() || getTodayDate();

  if (!expenseId) {
    return { ok: false, error: "Expense entry was not found." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid amount." };
  }

  if (!categoryId) {
    return { ok: false, error: "Choose a category." };
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, icon, color")
    .eq("id", categoryId)
    .single();

  if (categoryError || !category) {
    return {
      ok: false,
      error: categoryError?.message || "Selected category was not found.",
    };
  }

  const { error: updateError } = await supabase
    .from("expenses")
    .update({
      amount,
      category_id: category.id,
      category_name_snapshot: category.name,
      category_icon_snapshot: category.icon,
      category_color_snapshot: category.color,
      description,
      expense_date: expenseDate,
    })
    .eq("id", expenseId);

  if (updateError) {
    return {
      ok: false,
      error: updateError.message || "Could not update the expense.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/expenses");

  return { ok: true };
}

export async function deleteExpense(id: string): Promise<CreateExpenseResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to delete an expense." };
  }

  const expenseId = id.trim();

  if (!expenseId) {
    return { ok: false, error: "Expense entry was not found." };
  }

  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);

  if (error) {
    return { ok: false, error: error.message || "Could not delete the expense." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/expenses");

  return { ok: true };
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
