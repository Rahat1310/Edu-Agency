import { cn } from "@/lib/utils";

type PlaceholderBannerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PlaceholderBanner({
  children,
  className,
}: PlaceholderBannerProps) {
  return (
    <p
      role="note"
      data-placeholder="true"
      className={cn(
        "inline-flex max-w-full items-center rounded-full border border-dashed border-[var(--brand-amber)] bg-[#fff6e4] px-3 py-1 font-utility text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--brand-navy)] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
