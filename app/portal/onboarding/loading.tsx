import { DeskSkeleton } from "@/components/desk/skeleton";

export default function PortalOnboardingLoading() {
  return (
    <div
      className="mx-auto max-w-md space-y-3"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="sr-only">Loading</span>
      <DeskSkeleton className="h-7 w-56" />
      <DeskSkeleton className="h-16 w-full" />
      <DeskSkeleton className="h-11 w-full" />
    </div>
  );
}
