import { ExpensesManager } from "@/components/expenses-manager";
import { SectionHeading } from "@/components/section-heading";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Expenses"
        description="Log spending in a few taps and keep today in view."
      />

      <ExpensesManager />
    </div>
  );
}
