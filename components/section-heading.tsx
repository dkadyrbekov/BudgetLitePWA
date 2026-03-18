type SectionHeadingProps = {
  title: string;
  description: string;
};

export function SectionHeading({
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
