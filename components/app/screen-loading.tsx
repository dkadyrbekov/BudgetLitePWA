export function ScreenLoading({
  label,
  centered = false,
}: {
  label: string;
  centered?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[40vh] flex-col items-center justify-center gap-4 ${
        centered ? "min-h-screen" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-black" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-black/60 [animation-delay:120ms]" />
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-black/35 [animation-delay:240ms]" />
      </div>
      <p className="text-sm font-medium text-zinc-600">{label}</p>
    </div>
  );
}
