import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  titleId?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  lede,
  titleId,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <div className="inline-flex items-center gap-2">
        <span className="font-sans text-[0.7rem] font-semibold tracking-[0.18em] text-[var(--brand-blue)] uppercase">
          {eyebrow}
        </span>
      </div>
      <h2
        id={titleId}
        className="font-heading mt-4 text-3xl font-semibold tracking-tight text-balance text-slate-900 sm:text-[2.75rem] sm:leading-[1.15]"
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-4 text-[1.05rem] leading-relaxed font-normal text-slate-600">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
