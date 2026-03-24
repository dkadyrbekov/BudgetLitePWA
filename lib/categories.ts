import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CategoryListItem = {
  id: string;
  name: string;
  icon: string | null;
};

export async function getCategoryList(): Promise<CategoryListItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon")
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}
