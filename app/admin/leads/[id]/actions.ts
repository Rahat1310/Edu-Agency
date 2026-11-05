"use server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { counselorProfiles, leads, leadActivity, users } from "@/db/schema";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import { statuses } from "@/lib/consultation/schema";
export async function updateAssessment(form: FormData) {
  const actor = await requireDashboardAccess();
  const data = z
    .object({
      id: z.uuid(),
      status: z.enum(statuses),
      counselor: z.union([z.literal(""), z.uuid()]),
      note: z.string().trim().max(5000),
      followUp: z.string().max(30),
    })
    .parse(Object.fromEntries(form));
  if (
    data.followUp &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(data.followUp) ||
      !Number.isFinite(Date.parse(data.followUp)))
  )
    throw new Error("Invalid follow-up date");
  if (data.counselor) {
    const [c] = await db
      .select()
      .from(counselorProfiles)
      .innerJoin(users, eq(users.id, counselorProfiles.id))
      .where(eq(counselorProfiles.id, data.counselor));
    if (
      !c?.counselor_profiles.active ||
      !c.users.isActive ||
      !["admin", "counselor"].includes(c.users.role)
    )
      throw new Error("Choose an active staff counsellor");
  }
  const updated = db
    .update(leads)
    .set({
      assessmentStatus: data.status,
      assignedCounselorId: data.counselor || null,
      followUpAt: data.followUp
        ? new Date(`${data.followUp}T00:00:00+06:00`)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, data.id));
  const activity = db.insert(leadActivity).values({
    leadId: data.id,
    actorUserId: actor.id,
    type: "note",
    content: `Assessment status: ${data.status}. Assignment: ${data.counselor || "unassigned"}.${data.note ? `\n${data.note}` : ""}`,
    isVisibleToStudent: false,
  });
  await db.batch([updated, activity]);
  revalidatePath(`/admin/leads/${data.id}`);
  revalidatePath("/admin/leads");
}
export async function retryAssessmentNotification(form: FormData) {
  await requireDashboardAccess();
  const { id } = z.object({ id: z.uuid() }).parse(Object.fromEntries(form));
  // Explicit staff confirmation in the UI is needed for uncertain sends.
  await db.execute(
    sql`UPDATE assessment_outbox SET status='pending',next_attempt_at=now(),updated_at=now(),error=null WHERE id=${id}::uuid AND status IN ('failed','review_required','configuration_required')`,
  );
  revalidatePath("/admin/leads", "layout");
}
