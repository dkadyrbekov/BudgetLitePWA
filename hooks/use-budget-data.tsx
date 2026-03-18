"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  deleteCategory,
  deleteExpense,
  hydrateExpenseRow,
  insertCategory,
  insertExpense,
  loadCategories,
  loadExpenses,
  reorderCategories,
  updateCategory,
  updateExpense,
} from "@/lib/budget-api";
import { getTodayDate } from "@/lib/date";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BudgetCategory, BudgetExpense } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

type BudgetDataContextValue = {
  categories: BudgetCategory[];
  expenses: BudgetExpense[];
  loading: boolean;
  error: string | null;
  createCategory: (input: { name: string; icon: string }) => Promise<void>;
  editCategory: (input: { id: string; name: string; icon: string }) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  moveCategory: (id: string, direction: "up" | "down") => Promise<void>;
  createExpense: (input: {
    amount: number;
    categoryId: string;
    comment: string;
  }) => Promise<void>;
  editExpense: (input: {
    id: string;
    amount: number;
    categoryId: string;
    comment: string;
    date: string;
  }) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const BudgetDataContext = createContext<BudgetDataContextValue | null>(null);

export function BudgetDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const nextCategories = await loadCategories(supabase, user.id);
      const nextExpenses = await loadExpenses(supabase, user.id, nextCategories);

      setCategories(nextCategories);
      setExpenses(nextExpenses);
    } catch (refreshError) {
      setError(getErrorMessage(refreshError, "Failed to load data."));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void refresh();
  }, [authLoading, refresh]);

  async function createCategoryRecord(input: { name: string; icon: string }) {
    if (!user) {
      return;
    }

    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const nextCategory = await insertCategory(supabase, {
        userId: user.id,
        name: input.name,
        icon: input.icon,
        position: categories.length,
      });

      setCategories((current) => [...current, nextCategory]);
    } catch (createError) {
      setError(getErrorMessage(createError, "Failed to add category."));
      throw createError;
    }
  }

  async function editCategoryRecord(input: {
    id: string;
    name: string;
    icon: string;
  }) {
    if (!user) {
      return;
    }

    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const updated = await updateCategory(supabase, {
        userId: user.id,
        id: input.id,
        name: input.name,
        icon: input.icon,
      });

      setCategories((current) =>
        current.map((category) =>
          category.id === input.id ? { ...category, ...updated } : category,
        ),
      );
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update category."));
      throw updateError;
    }
  }

  async function removeCategoryRecord(id: string) {
    if (!user) {
      return;
    }

    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      await deleteCategory(supabase, {
        userId: user.id,
        id,
      });

      setCategories((current) =>
        current
          .filter((category) => category.id !== id)
          .map((category, index) => ({ ...category, position: index })),
      );
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Failed to delete category."));
      throw deleteError;
    }
  }

  async function moveCategoryRecord(id: string, direction: "up" | "down") {
    if (!user) {
      return;
    }

    const index = categories.findIndex((category) => category.id === id);

    if (index === -1) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= categories.length) {
      return;
    }

    const nextCategories = [...categories];
    const [item] = nextCategories.splice(index, 1);
    nextCategories.splice(targetIndex, 0, item);

    const orderedCategories = nextCategories.map((category, nextIndex) => ({
      ...category,
      position: nextIndex,
    }));

    setCategories(orderedCategories);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      await reorderCategories(supabase, {
        userId: user.id,
        categories: orderedCategories,
      });
    } catch (reorderError) {
      setError(getErrorMessage(reorderError, "Failed to reorder categories."));
      await refresh();
      throw reorderError;
    }
  }

  async function createExpenseRecord(input: {
    amount: number;
    categoryId: string;
    comment: string;
  }) {
    if (!user) {
      return;
    }

    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const nextExpenseRow = await insertExpense(supabase, {
        userId: user.id,
        amount: input.amount,
        categoryId: input.categoryId,
        comment: input.comment,
        date: getTodayDate(),
      });
      const nextExpense = hydrateExpenseRow(nextExpenseRow, categories);

      setExpenses((current) => [nextExpense, ...current]);
    } catch (createError) {
      setError(getErrorMessage(createError, "Failed to save expense."));
      throw createError;
    }
  }

  async function editExpenseRecord(input: {
    id: string;
    amount: number;
    categoryId: string;
    comment: string;
    date: string;
  }) {
    if (!user) {
      return;
    }

    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const updatedRow = await updateExpense(supabase, {
        userId: user.id,
        ...input,
      });
      const updated = hydrateExpenseRow(updatedRow, categories);

      setExpenses((current) =>
        current.map((expense) => (expense.id === input.id ? updated : expense)),
      );
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Failed to update expense."));
      throw updateError;
    }
  }

  async function removeExpenseRecord(id: string) {
    if (!user) {
      return;
    }

    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      await deleteExpense(supabase, {
        userId: user.id,
        id,
      });

      setExpenses((current) => current.filter((expense) => expense.id !== id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Failed to delete expense."));
      throw deleteError;
    }
  }

  return (
    <BudgetDataContext.Provider
      value={{
        categories,
        expenses,
        loading: authLoading || loading,
        error,
        createCategory: createCategoryRecord,
        editCategory: editCategoryRecord,
        removeCategory: removeCategoryRecord,
        moveCategory: moveCategoryRecord,
        createExpense: createExpenseRecord,
        editExpense: editExpenseRecord,
        removeExpense: removeExpenseRecord,
        refresh,
      }}
    >
      {children}
    </BudgetDataContext.Provider>
  );
}

export function useBudgetData() {
  const context = useContext(BudgetDataContext);

  if (!context) {
    throw new Error("useBudgetData must be used within BudgetDataProvider");
  }

  return context;
}
