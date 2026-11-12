"use server";
import { revalidatePath } from "next/cache";
import { loadApplicationCase } from "@/lib/applications/load";
import {
  applicationTrackingSteps,
  applyTrackingUpdate,
  trackingStatusLabels,
  trackingUpdateSchema,
} from "@/lib/applications/tracking";
import {
  applicationTrackingUpdateQuery,
  applicationReviewQuery,
} from "@/lib/applications/queries";
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

export async function updateApplicationTracking(
  input: unknown,
): Promise<{ ok: boolean; message: string }> {
  const user = await requireDashboardAccess();
  const parsed = trackingUpdateSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check the tracker update.",
    };
  const data = parsed.data;
  try {
    const application = await loadApplicationCase(data.id);
    if (!application?.submittedAt)
      return {
        ok: false,
        message: "The student must submit their application first.",
      };
    if (application.trackingVersion !== data.version)
      return {
        ok: false,
        message:
          "Another counsellor updated this tracker. Refresh before saving.",
      };
    const next = applyTrackingUpdate(
      application.tracking,
      data,
      new Date().toISOString(),
    );
    if (!next.ok) return next;
    const label = applicationTrackingSteps.find(
      (step) => step.id === data.step,
    )!.label;
    const message = `${label}: ${trackingStatusLabels[data.status]}${data.note ? `\n${data.note}` : ""}`;
    const result = await db.execute(
      applicationTrackingUpdateQuery({
        id: data.id,
        version: data.version,
        tracking: next.tracking,
        actorId: user.id,
        message,
      }),
    );
    if (!result.rows.length)
      return {
        ok: false,
        message: "The tracker changed while saving. Refresh and try again.",
      };
    revalidatePath("/admin/applications", "layout");
    revalidatePath("/admin/leads");
    revalidatePath("/portal", "layout");
    return {
      ok: true,
      message: "Tracker updated. The student can see this update.",
    };
  } catch {
    return {
      ok: false,
      message: "The tracker could not be saved. Please try again.",
    };
  }
}
