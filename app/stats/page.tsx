import { StatsManager } from "@/components/stats-manager";
import { SectionHeading } from "@/components/section-heading";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Stats"
        description="A quick snapshot of where the month is going."
      />

      <StatsManager />
    </div>
  );
}
