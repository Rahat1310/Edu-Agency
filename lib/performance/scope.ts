import { z } from "zod";

import type { UserRole } from "@/db/schema";

export type PerformanceScope = {
  counselorId: string | null;
  combined: boolean;
};

export function isCounselorId(value: string): boolean {
  return z.string().uuid().safeParse(value).success;
}

/**
 * Counselors are locked to their own book. Admins may pick one counselor
 * or the combined assigned total. Query params are never trusted for
 * counselors.
 */
export function resolvePerformanceScope(input: {
  role: UserRole;
  userId: string;
  requestedCounselorId: string;
}): PerformanceScope {
  if (input.role !== "admin") {
    return { counselorId: input.userId, combined: false };
  }

  if (
    input.requestedCounselorId === "" ||
    input.requestedCounselorId === "all"
  ) {
    return { counselorId: null, combined: true };
  }

  if (!isCounselorId(input.requestedCounselorId)) {
    return { counselorId: null, combined: true };
  }

  return { counselorId: input.requestedCounselorId, combined: false };
}
