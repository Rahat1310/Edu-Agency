import { getDashboardUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getDashboardUser();

  return Response.json(
    { canAccessAdminPanel: Boolean(user) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
