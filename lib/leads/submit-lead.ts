import { leads } from "@/db/schema";
import type { LeadSubmitResult } from "@/lib/leads/types";
import { rateLimit } from "@/lib/rate-limit";
import {
  isHoneypotFilled,
  leadSubmissionSchema,
  resolveLeadSource,
} from "@/lib/schemas/lead";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { validateRequest } from "@/lib/validation-helpers";

const TURNSTILE_MESSAGE =
  "We could not verify that this submission came from a person. Refresh the check and try again.";

const RATE_LIMIT_MESSAGE =
  "Please wait before sending another message. You can try again in an hour.";

const CONFIG_MESSAGE =
  "The form is not ready to accept messages yet. Use WhatsApp or email instead.";

const SERVER_MESSAGE =
  "We could not send that just now. Try again, or use WhatsApp.";

/**
 * Shared lead-capture handler. Order: rate limit → honeypot (silent
 * success) → Zod → Turnstile siteverify → insert with status `new`.
 */
export async function submitLead(
  input: unknown,
  ip: string,
): Promise<LeadSubmitResult> {
  const limited = await rateLimit("lead-form", ip);

  if (!limited.allowed) {
    return {
      ok: false,
      code: "rate_limit",
      message: RATE_LIMIT_MESSAGE,
    };
  }

  if (isHoneypotFilled(input)) {
    return { ok: true };
  }

  const parsed = validateRequest(leadSubmissionSchema, input);

  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.message,
      fields: parsed.error.fields,
    };
  }

  const turnstile = await verifyTurnstileToken(parsed.data.turnstileToken, ip);

  if (!turnstile.ok) {
    if (turnstile.reason === "missing_secret") {
      return { ok: false, code: "config", message: CONFIG_MESSAGE };
    }

    return { ok: false, code: "turnstile", message: TURNSTILE_MESSAGE };
  }

  try {
    const { db } = await import("@/db");
    await db.insert(leads).values({
      name: parsed.data.name,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email,
      destinationInterest: parsed.data.destinationInterest,
      message: parsed.data.message,
      source: resolveLeadSource(parsed.data.source),
      status: "new",
    });
  } catch {
    return { ok: false, code: "server", message: SERVER_MESSAGE };
  }

  return { ok: true };
}
