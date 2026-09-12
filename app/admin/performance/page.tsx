import { PerformanceDashboard } from "@/components/admin/performance-dashboard";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import { loadPerformanceSnapshot } from "@/lib/performance/load";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPerformancePage({
  searchParams,
}: PageProps) {
  const user = await requireDashboardAccess();
  const snapshot = await loadPerformanceSnapshot(user, await searchParams);

  return <PerformanceDashboard snapshot={snapshot} />;
}
