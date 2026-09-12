import "server-only";

import { getStudentApplication } from "@/lib/auth-helpers";
import type { StudentApplication } from "@/lib/auth-helpers";
import { decideOwnedApplication } from "@/lib/documents/ownership";

export type ApplicationAccess =
  | { ok: true; application: StudentApplication }
  | { ok: false; status: 401 | 403; message: string };

export async function requireOwnedApplication(
  claimedApplicationId: string,
): Promise<ApplicationAccess> {
  const linked = await getStudentApplication();
  const decision = decideOwnedApplication(
    linked?.application.id ?? null,
    claimedApplicationId,
  );

  if (!decision.ok) {
    return decision;
  }

  if (!linked) {
    return {
      ok: false,
      status: 401,
      message: "Sign in to your student file first.",
    };
  }

  return { ok: true, application: linked };
}
