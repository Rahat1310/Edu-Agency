"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { applications } from "@/db/schema";
import { AiGatewayError } from "@/lib/ai/types";
import { getStudentApplication, requireRole } from "@/lib/auth-helpers";
import {
  profileFromLeadContext,
  toStoredMatchProfile,
} from "@/lib/matching/profile";
import { runProgramMatches } from "@/lib/matching/run";
import { rateLimit } from "@/lib/rate-limit";
import { matchProfileFormSchema } from "@/lib/schemas/match-profile";
import { validateRequest } from "@/lib/validation-helpers";

export type MatchProfileActionState = {
  error?: string;
  fields?: Record<string, string[]>;
};

export async function saveMatchProfile(
  input: unknown,
): Promise<MatchProfileActionState> {
  await requireRole("student");
  const linked = await getStudentApplication();

  if (!linked) {
    return { error: "We still need to link your file before matching." };
  }

  const parsed = validateRequest(matchProfileFormSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db
    .update(applications)
    .set({ profile: toStoredMatchProfile(parsed.data) })
    .where(eq(applications.id, linked.application.id));

  revalidatePath("/portal");
  revalidatePath("/portal/matches");
  return {};
}

export async function refreshProgramMatches(): Promise<{
  error?: string;
}> {
  const user = await requireRole("student");
  const limited = await rateLimit("match-refresh", user.id);

  if (!limited.allowed) {
    return {
      error: "Give it a little time, then refresh again.",
    };
  }

  const linked = await getStudentApplication();
  if (!linked) {
    return { error: "We still need to link your file before matching." };
  }

  const profile = profileFromLeadContext({
    savedProfile: linked.application.profile,
    quizAnswers: linked.lead.quizAnswers,
    destinationInterest: linked.lead.destinationInterest,
  });

  if (!profile) {
    return { error: "Save your education, destination, and budget first." };
  }

  try {
    await runProgramMatches(profile, true);
  } catch (error) {
    if (error instanceof AiGatewayError) {
      return {
        error:
          "We couldn't rank programs just now. Try again in a few minutes, or WhatsApp us.",
      };
    }

    throw error;
  }

  revalidatePath("/portal/matches");
  revalidatePath("/portal");
  return {};
}
