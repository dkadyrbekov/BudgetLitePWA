"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { BudgetCategory, BudgetExpense } from "@/lib/types";

type CategoryRow = {
  id: string;
  name: string;
  icon: string;
  position: number | null;
};

type ExpenseRow = {
  id: string;
  amount: number | string;
  comment: string | null;
  category_id: string;
  spent_at: string;
  created_at: string;
};

function mapCategory(row: CategoryRow): BudgetCategory {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    position: row.position ?? 0,
  };
}

function mapExpense(row: ExpenseRow, categories: BudgetCategory[]): BudgetExpense {
  const category = categories.find(
    (item) => item.id === row.category_id,
  );
  const createdAt = row.created_at;

  return {
    id: row.id,
    amount: Number(row.amount),
    comment: row.comment ?? "",
    categoryId: row.category_id,
    categoryName: category?.name ?? "Category",
    categoryIcon: category?.icon ?? "💸",
    date: row.spent_at,
    time: createdAt.slice(11, 16),
    createdAt,
  };
}

export async function loadCategories(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon, position")
    .eq("user_id", userId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as CategoryRow[]).map(mapCategory);
}

export async function loadExpenses(
  supabase: SupabaseClient,
  userId: string,
  categories: BudgetCategory[],
) {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount, comment, category_id, spent_at, created_at")
    .eq("user_id", userId)
    .order("spent_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ExpenseRow[]).map((row) => mapExpense(row, categories));
}

export async function insertCategory(
  supabase: SupabaseClient,
  input: {
    userId: string;
    name: string;
    icon: string;
    position: number;
  },
) {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: input.userId,
      name: input.name,
      icon: input.icon,
      position: input.position,
    })
    .select("id, name, icon, position")
    .single();

  if (error) {
    throw error;
  }

  return mapCategory(data as CategoryRow);
}

export async function updateCategory(
  supabase: SupabaseClient,
  input: {
    userId: string;
    id: string;
    name: string;
    icon: string;
  },
) {
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      icon: input.icon,
    })
    .eq("id", input.id)
    .eq("user_id", input.userId)
    .select("id, name, icon, position")
    .single();

  if (error) {
    throw error;
  }

  return mapCategory(data as CategoryRow);
}

export async function deleteCategory(
  supabase: SupabaseClient,
  input: {
    userId: string;
    id: string;
  },
) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", input.id)
    .eq("user_id", input.userId);

  if (error) {
    throw error;
  }
}

export async function reorderCategories(
  supabase: SupabaseClient,
  input: {
    userId: string;
    categories: BudgetCategory[];
  },
) {
  const updates = input.categories.map((category, index) =>
    supabase
      .from("categories")
      .update({ position: index })
      .eq("id", category.id)
      .eq("user_id", input.userId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw failed.error;
  }
}

export async function insertExpense(
  supabase: SupabaseClient,
  input: {
    userId: string;
    categoryId: string;
    amount: number;
    comment: string;
    date: string;
  },
) {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: input.userId,
      category_id: input.categoryId,
      amount: input.amount,
      comment: input.comment || null,
      spent_at: input.date,
    })
    .select("id, amount, comment, category_id, spent_at, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as ExpenseRow;
}

export async function updateExpense(
  supabase: SupabaseClient,
  input: {
    userId: string;
    id: string;
    categoryId: string;
    amount: number;
    comment: string;
    date: string;
  },
) {
  const { data, error } = await supabase
    .from("expenses")
    .update({
      category_id: input.categoryId,
      amount: input.amount,
      comment: input.comment || null,
      spent_at: input.date,
    })
    .eq("id", input.id)
    .eq("user_id", input.userId)
    .select("id, amount, comment, category_id, spent_at, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as ExpenseRow;
}

export function hydrateExpenseRow(
  row: ExpenseRow,
  categories: BudgetCategory[],
) {
  return mapExpense(row, categories);
}

export async function deleteExpense(
  supabase: SupabaseClient,
  input: {
    userId: string;
    id: string;
  },
) {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", input.id)
    .eq("user_id", input.userId);

  if (error) {
    throw error;
  }
}
