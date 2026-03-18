import type { BudgetCategory } from "@/lib/mock-data";

type CategoryGridProps = {
  categories: BudgetCategory[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
        >
          <span className="text-2xl">{category.icon}</span>
          <h2 className="mt-4 text-base font-semibold text-slate-900">
            {category.name}
          </h2>
          <p className="mt-2 text-sm text-slate-500">Expense category</p>
        </div>
      ))}
    </div>
  );
}
