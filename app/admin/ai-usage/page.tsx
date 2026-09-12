import { AiUsageDashboard } from "@/components/admin/ai-usage-dashboard";
import { loadAiUsageDashboard } from "@/lib/ai/usage-summary";
import { requireDashboardAccess } from "@/lib/auth-helpers";

export default async function AdminAiUsagePage() {
  await requireDashboardAccess();
  const data = await loadAiUsageDashboard();

  return (
    <AiUsageDashboard
      todayYmd={data.todayYmd}
      providers={data.providers}
      daily={data.daily}
    />
  );
}
