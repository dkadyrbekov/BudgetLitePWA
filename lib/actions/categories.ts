"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CategoryInput = {
  name: string;
  icon: string;
};

type UpdateCategoryInput = CategoryInput & {
  id: string;
};

type CategoryActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createCategory(
  input: CategoryInput,
): Promise<CategoryActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to add a category." };
  }

  const name = input.name.trim();
  const icon = input.icon.trim();

  if (!name) {
    return { ok: false, error: "Enter a category name." };
  }

  if (!icon) {
    return { ok: false, error: "Enter an emoji icon." };
  }

  const { error } = await supabase.from("categories").insert({
    name,
    icon,
    color: null,
  });

  if (error) {
    return { ok: false, error: "Could not save the category." };
  }

  revalidateBudgetPaths();
  return { ok: true };
}

export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<CategoryActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to edit a category." };
  }

  const id = input.id.trim();
  const name = input.name.trim();
  const icon = input.icon.trim();

  if (!id) {
    return { ok: false, error: "Category was not found." };
  }

  if (!name) {
    return { ok: false, error: "Enter a category name." };
  }

  if (!icon) {
    return { ok: false, error: "Enter an emoji icon." };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      icon,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: "Could not update the category." };
  }

  revalidateBudgetPaths();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to delete a category." };
  }

  const categoryId = id.trim();

  if (!categoryId) {
    return { ok: false, error: "Category was not found." };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    return { ok: false, error: "Could not delete the category." };
  }

  revalidateBudgetPaths();
  return { ok: true };
}

function revalidateBudgetPaths() {
  revalidatePath("/categories");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
