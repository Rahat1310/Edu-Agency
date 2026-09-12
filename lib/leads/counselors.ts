import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { dashboardRoles } from "@/lib/authz";

export type AssignableCounselor = {
  id: string;
  label: string;
  role: UserRole;
};

function counselorLabel(name: string | null, email: string): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : email;
}

export async function listAssignableCounselors(): Promise<
  AssignableCounselor[]
> {
  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(and(inArray(users.role, dashboardRoles), eq(users.isActive, true)))
    .orderBy(asc(users.fullName), asc(users.email));

  return rows.map((row) => ({
    id: row.id,
    label: counselorLabel(row.fullName, row.email),
    role: row.role,
  }));
}

export async function getAssignableCounselor(
  id: string,
): Promise<AssignableCounselor | null> {
  const [row] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(
      and(
        eq(users.id, id),
        inArray(users.role, dashboardRoles),
        eq(users.isActive, true),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    label: counselorLabel(row.fullName, row.email),
    role: row.role,
  };
}
