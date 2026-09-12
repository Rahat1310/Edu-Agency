"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-helpers";
import { syncStudentApplicationLink } from "@/lib/leads/link-student";
import { rateLimit } from "@/lib/rate-limit";
import { portalPhoneSchema } from "@/lib/schemas/portal";
import { validateRequest } from "@/lib/validation-helpers";

export type PortalPhoneResult = { ok: true } | { ok: false; message: string };

export async function submitPortalPhone(
  input: unknown,
): Promise<PortalPhoneResult> {
  const user = await requireRole("student");
  const limited = await rateLimit("portal-phone", user.id);

  if (!limited.allowed) {
    return {
      ok: false,
      message: "Give it an hour, then try again with the same number.",
    };
  }

  const parsed = validateRequest(portalPhoneSchema, input);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.fields.phone?.[0] ?? "Enter a phone number we can reach.",
    };
  }

  const result = await syncStudentApplicationLink({
    user,
    phone: parsed.data.phone,
  });

  revalidatePath("/portal");
  revalidatePath("/portal/onboarding");

  if (result.status === "linked") {
    redirect("/portal");
  }

  return { ok: true };
}
