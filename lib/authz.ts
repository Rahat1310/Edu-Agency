import type { UserRole } from "@/db/schema";

export type AccessDecision = "unauthenticated" | "forbidden" | "ok";

/** Roles that may enter `/admin` and the counselor desk. */
export const dashboardRoles = ["admin", "counselor"] as const satisfies readonly UserRole[];

export type DashboardRole = (typeof dashboardRoles)[number];

export function decideRoleAccess(
  clerkUserId: string | null | undefined,
  user: { role: string; isActive: boolean } | null | undefined,
  required: UserRole | readonly UserRole[],
): AccessDecision {
  if (!clerkUserId) {
    return "unauthenticated";
  }

  if (!user || !user.isActive) {
    return "unauthenticated";
  }

  const allowed = typeof required === "string" ? [required] : required;

  if (!allowed.some((role) => role === user.role)) {
    return "forbidden";
  }

  return "ok";
}
