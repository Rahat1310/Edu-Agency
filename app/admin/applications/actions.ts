"use server";
import { revalidatePath } from "next/cache";
import { applicationReviewQuery } from "@/lib/applications/queries";
import { db } from "@/db";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import { applicationReviewSchema } from "@/lib/applications/review-schema";

export async function reviewStudentApplication(
  input: unknown,
): Promise<{ ok: boolean; message: string }> {
  const user = await requireDashboardAccess();
  const parsed = applicationReviewSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check the review details.",
    };
  const data = parsed.data;
  try {
    const result = await db.execute(applicationReviewQuery(data, user.id));
    if (!result.rows.length)
      return {
        ok: false,
        message:
          "This application changed or has not been submitted. Refresh before reviewing.",
      };
    for (const path of [
      "/admin/applications",
      `/admin/applications/${data.id}`,
      "/admin/leads",
      "/admin/pipeline",
      "/portal",
      "/portal/application",
      "/portal/documents",
    ])
      revalidatePath(path);
    return {
      ok: true,
      message:
        "Application review saved. The student can see the published update.",
    };
  } catch {
    return {
      ok: false,
      message: "The review was not saved. Please try again.",
    };
  }
}
