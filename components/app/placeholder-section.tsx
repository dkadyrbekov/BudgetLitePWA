type PlaceholderSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderSection({
  eyebrow,
  title,
  description,
}: PlaceholderSectionProps) {
  return (
    <section className="rounded-3xl border border-dashed border-black/15 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>
    </section>
  );
}
