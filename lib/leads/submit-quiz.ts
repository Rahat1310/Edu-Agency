import { leads } from "@/db/schema";
import {
  scoreEligibility,
  type EligibilityResult,
  type StoredQuizAnswers,
} from "@/lib/eligibility";
import type { LeadSubmitFailure } from "@/lib/leads/types";
import { rateLimit } from "@/lib/rate-limit";
import { eligibilitySubmissionSchema } from "@/lib/schemas/eligibility";
import { isHoneypotFilled } from "@/lib/schemas/lead";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { validateRequest } from "@/lib/validation-helpers";

const TURNSTILE_MESSAGE =
  "We could not verify that this submission came from a person. Refresh the check and try again.";

const RATE_LIMIT_MESSAGE =
  "Please wait before sending another quiz. You can try again in a few minutes.";

const CONFIG_MESSAGE =
  "The quiz is not ready to save results yet. Use WhatsApp or the contact form instead.";

const SERVER_MESSAGE =
  "We could not save that just now. Try again, or use WhatsApp.";

export type QuizSubmitSuccess = {
  ok: true;
  result: EligibilityResult;
};

export type QuizSubmitResult = QuizSubmitSuccess | LeadSubmitFailure;

function answersFromParsed(data: {
  educationLevel: StoredQuizAnswers["educationLevel"];
  destination: StoredQuizAnswers["destination"];
  ielts?: number;
  toefl?: number;
  hsk?: number;
  topik?: number;
  budget: StoredQuizAnswers["budget"];
}) {
  return {
    educationLevel: data.educationLevel,
    destination: data.destination,
    ielts: data.ielts,
    toefl: data.toefl,
    hsk: data.hsk,
    topik: data.topik,
    budget: data.budget,
  };
}

/**
 * Rate limit → honeypot (score, no write) → Zod → Turnstile →
 * scoreEligibility (local rules only) → insert lead.
 */
export async function submitEligibilityQuiz(
  input: unknown,
  ip: string,
): Promise<QuizSubmitResult> {
  const limited = await rateLimit("eligibility-quiz", ip);

  if (!limited.allowed) {
    return {
      ok: false,
      code: "rate_limit",
      message: RATE_LIMIT_MESSAGE,
    };
  }

  if (isHoneypotFilled(input)) {
    const parsed = eligibilitySubmissionSchema.safeParse(input);
    if (parsed.success) {
      return {
        ok: true,
        result: scoreEligibility(answersFromParsed(parsed.data)),
      };
    }

    return {
      ok: true,
      result: scoreEligibility({
        educationLevel: "hsc",
        destination: "india",
        budget: "8_15l",
      }),
    };
  }

  const parsed = validateRequest(eligibilitySubmissionSchema, input);

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

  const answers = answersFromParsed(parsed.data);
  const result = scoreEligibility(answers);
  const quizAnswers: StoredQuizAnswers = { ...answers, result };

  try {
    const { db } = await import("@/db");
    await db.insert(leads).values({
      name: parsed.data.name,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email,
      destinationInterest: answers.destination,
      message: `Eligibility quiz: ${result.verdict}`,
      quizAnswers,
      source: "eligibility-quiz",
      status: "new",
    });
  } catch {
    return { ok: false, code: "server", message: SERVER_MESSAGE };
  }

  return { ok: true, result };
}
