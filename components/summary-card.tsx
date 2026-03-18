type SummaryCardProps = {
  label: string;
  value: string;
  tone: "dark" | "light";
};

export function SummaryCard({ label, value, tone }: SummaryCardProps) {
  const styles =
    tone === "dark"
      ? "bg-slate-950 text-white"
      : "border border-black/5 bg-white text-slate-950";

  return (
    <div className={`rounded-3xl p-4 shadow-sm ${styles}`}>
      <p
        className={`text-sm ${
          tone === "dark" ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
