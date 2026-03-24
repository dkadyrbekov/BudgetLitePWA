import { CategorySheet } from "@/components/categories/category-sheet";
import { DeleteCategoryButton } from "@/components/categories/delete-category-button";
import { getCategoryList } from "@/lib/categories";

export default async function CategoriesPage() {
  const categories = await getCategoryList();

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Categories
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
              Budget categories
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Manage the active category list used for new expenses.
            </p>
          </div>

          <CategorySheet
            triggerLabel="Add Category"
            triggerClassName="flex h-12 shrink-0 items-center justify-center rounded-[1rem] bg-black px-4 text-sm font-semibold text-white transition active:scale-[0.99]"
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Active
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-black">
              Category list
            </h2>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="mt-4 space-y-3">
            {categories.map((category) => (
              <article
                key={category.id}
                className="rounded-2xl bg-zinc-50 px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    {category.icon || "🙂"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-black">
                      {category.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Active for new expense entries
                    </p>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <CategorySheet
                        mode="edit"
                        category={category}
                        triggerLabel="Edit"
                        triggerClassName="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-zinc-700 transition"
                      />
                      <DeleteCategoryButton id={category.id} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-4 text-sm leading-6 text-zinc-600">
            No categories yet. Add the first one to start fast expense entry.
          </div>
        )}
      </section>
    </div>
  );
}
