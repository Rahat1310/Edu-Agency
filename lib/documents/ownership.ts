export type OwnedApplicationDecision =
  { ok: true } | { ok: false; status: 401 | 403; message: string };

/**
 * Compare the session's application with the ID the client asked to write to.
 * A mismatch is 403 (not silently remapped) so the API can be tested directly.
 */
export function decideOwnedApplication(
  linkedApplicationId: string | null,
  claimedApplicationId: string,
): OwnedApplicationDecision {
  if (!linkedApplicationId) {
    return {
      ok: false,
      status: 401,
      message: "Sign in to your student file first.",
    };
  }

  if (linkedApplicationId !== claimedApplicationId) {
    return {
      ok: false,
      status: 403,
      message: "You cannot upload to another student's file.",
    };
  }

  return { ok: true };
}
