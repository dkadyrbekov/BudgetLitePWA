import { CategoriesManager } from "@/components/categories-manager";
import { SectionHeading } from "@/components/section-heading";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Categories"
        description="Create, edit, remove, and reorder the categories used for fast expense entry."
      />

      <CategoriesManager />
    </div>
  );
}
