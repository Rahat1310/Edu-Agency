const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; reason: "missing_secret" | "rejected" | "unreachable" };

type SiteverifyResponse = {
  success?: boolean;
};

/**
 * Verify a Turnstile token against Cloudflare's siteverify endpoint.
 * Does not throw — callers map the result to a user-facing error.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secret) {
    return { ok: false, reason: "missing_secret" };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp && remoteIp !== "unknown") {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      return { ok: false, reason: "unreachable" };
    }

    const payload = (await response.json()) as SiteverifyResponse;

    if (payload.success === true) {
      return { ok: true };
    }

    return { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
