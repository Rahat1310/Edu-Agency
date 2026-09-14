import "server-only";

import { cache } from "react";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";
import { dashboardRoles, decideRoleAccess } from "@/lib/authz";
import { loadStudentApplicationByUserId } from "@/lib/leads/link-student";
import type {
  StudentApplicationRow,
  StudentLead,
} from "@/lib/leads/link-student";

const userColumns = {
  id: users.id,
  clerkId: users.clerkId,
  email: users.email,
  fullName: users.fullName,
  role: users.role,
  isActive: users.isActive,
} as const;

export type SessionUser = {
  id: string;
  clerkId: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
};

export type StudentApplication = {
  user: SessionUser;
  application: StudentApplicationRow;
  lead: StudentLead;
};

function isConfiguredAdmin(email: string): boolean {
  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return configured.includes(email.toLowerCase());
}

const loadSessionUser = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return { userId: null, user: null };
  }

  let [user] = await db
    .select(userColumns)
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  // Auto-provision user if webhook was delayed, missing, or not yet triggered
  if (!user) {
    try {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const email =
          clerkUser.primaryEmailAddress?.emailAddress ??
          clerkUser.emailAddresses[0]?.emailAddress ??
          "";
        const fullName =
          [clerkUser.firstName, clerkUser.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || null;

        if (email) {
          const role: UserRole = isConfiguredAdmin(email) ? "admin" : "student";
          const [inserted] = await db
            .insert(users)
            .values({
              clerkId: userId,
              email,
              fullName,
              role,
            })
            .onConflictDoUpdate({
              target: users.clerkId,
              set: {
                email,
                fullName,
                isActive: true,
                updatedAt: new Date(),
              },
            })
            .returning(userColumns);

          user = inserted;
        }
      }
    } catch (err) {
      console.error("[auth] Failed to auto-provision user from Clerk:", err);
    }
  } else if (isConfiguredAdmin(user.email) && user.role !== "admin") {
    // Elevate user to admin if their email is in ADMIN_EMAILS
    try {
      const [updated] = await db
        .update(users)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(users.id, user.id))
        .returning(userColumns);
      if (updated) {
        user = updated;
      }
    } catch (err) {
      console.error("[auth] Failed to elevate admin role:", err);
    }
  }

  return { userId, user };
});

export async function getSessionUser() {
  return loadSessionUser();
}

function settleAccess(
  userId: string | null,
  user: Awaited<ReturnType<typeof loadSessionUser>>["user"],
  decision: ReturnType<typeof decideRoleAccess>,
) {
  if (decision === "unauthenticated") {
    redirect("/sign-in");
  }

  if (decision === "forbidden") {
    redirect("/dashboard?error=forbidden");
  }

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const { userId, user } = await loadSessionUser();
  return settleAccess(userId, user, decideRoleAccess(userId, user, role));
}

/** General `/admin` access — counselor or admin. Destructive actions still use `requireRole("admin")`. */
export async function requireDashboardAccess() {
  const { userId, user } = await loadSessionUser();
  return settleAccess(
    userId,
    user,
    decideRoleAccess(userId, user, dashboardRoles),
  );
}

/** Same role check as the desk, without redirects — for JSON API routes. */
export async function getDashboardUser(): Promise<SessionUser | null> {
  const { userId, user } = await loadSessionUser();
  if (decideRoleAccess(userId, user, dashboardRoles) !== "ok" || !user) {
    return null;
  }
  return user;
}

export type StudentGate =
  { status: "ok"; user: SessionUser } | { status: "provisioning" };

/** Student portal gate. Staff are sent to `/admin`. Missing `users` row waits for the Clerk webhook. */
export async function requireStudent(): Promise<StudentGate> {
  const { userId, user } = await loadSessionUser();

  if (!userId) {
    redirect("/sign-in");
  }

  if (!user) {
    return { status: "provisioning" };
  }

  if (!user.isActive) {
    redirect("/sign-in");
  }

  if (dashboardRoles.some((role) => role === user.role)) {
    redirect("/admin");
  }

  if (user.role !== "student") {
    redirect("/sign-in");
  }

  return { status: "ok", user };
}

/**
 * Linked lead + application for the current session, or null when the
 * student has not been matched yet. Phase 4 portal pages use this to
 * decide what to show.
 */
export const getStudentApplication = cache(
  async (): Promise<StudentApplication | null> => {
    const { user } = await loadSessionUser();

    if (!user) {
      return null;
    }

    const linked = await loadStudentApplicationByUserId(user.id);

    if (!linked) {
      return null;
    }

    return { user, ...linked };
  },
);
