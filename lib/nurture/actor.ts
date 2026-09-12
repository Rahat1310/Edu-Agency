import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export const NURTURE_ACTOR_CLERK_ID = "system:nurture";

export async function ensureNurtureActorUserId(): Promise<string> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, NURTURE_ACTOR_CLERK_ID))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  const [inserted] = await db
    .insert(users)
    .values({
      clerkId: NURTURE_ACTOR_CLERK_ID,
      email: "nurture@internal",
      fullName: "Nurture sequence",
      role: "admin",
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  if (inserted) {
    return inserted.id;
  }

  const [retry] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, NURTURE_ACTOR_CLERK_ID))
    .limit(1);

  if (!retry) {
    throw new Error("Could not create the nurture automation user.");
  }

  return retry.id;
}
