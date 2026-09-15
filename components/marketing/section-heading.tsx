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
      <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 shadow-2xs backdrop-blur-md">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        <span className="font-utility text-[0.68rem] font-bold tracking-[0.16em] text-orange-700 uppercase">
          {eyebrow}
        </span>
      </div>
      <h2
        id={titleId}
        className="font-heading mt-6 text-3xl font-black tracking-tight text-balance text-slate-900 sm:text-[2.75rem] sm:leading-[1.15]"
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
