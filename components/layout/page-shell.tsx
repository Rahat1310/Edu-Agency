import { cn } from "@/lib/utils";

type PageShellProps = React.ComponentProps<"div">;

export function PageShell({ className, ...props }: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[78rem] px-5 sm:px-8 lg:px-10",
        className,
      )}
      {...props}
    />
  );
}
