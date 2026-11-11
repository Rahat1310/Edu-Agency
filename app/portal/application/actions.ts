"use server";
import { revalidatePath } from "next/cache";
import { studentApplicationSaveQuery } from "@/lib/applications/queries";
import { z } from "zod";
import { db } from "@/db";
import { getStudentApplication, requireRole } from "@/lib/auth-helpers";
import {
  applicationDataSchema,
  canEditApplication,
  submittedApplicationSchema,
} from "@/lib/applications/schema";
import { loadApplicationCase } from "@/lib/applications/load";
import { missingApplicationDocuments } from "@/lib/applications/documents";
import { listDocumentsForApplication } from "@/lib/documents/list";
import { rateLimit } from "@/lib/rate-limit";

export type SaveApplicationResult =
  | { ok: true; revision: number; message: string }
  | { ok: false; message: string; fields?: Record<string, string> };
const inputSchema = z.object({
  revision: z.number().int().nonnegative(),
  mode: z.enum(["draft", "submit"]),
  data: applicationDataSchema,
});
export async function saveStudentApplication(
  input: unknown,
): Promise<SaveApplicationResult> {
  const user = await requireRole("student");
  const linked = await getStudentApplication();
  if (!linked)
    return { ok: false, message: "Complete account onboarding first." };
  if (!(await rateLimit("application-save", user.id)).allowed)
    return { ok: false, message: "Please wait before saving again." };
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      message: "Check your form details.",
      fields: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.slice(1).join("."), i.message]),
      ),
    };
  const current = await loadApplicationCase(linked.application.id);
  if (!current || !canEditApplication(current.formStatus))
    return {
      ok: false,
      message:
        "Your submitted form is being reviewed. Contact your counsellor to request a change.",
    };
  const { data, mode, revision } = parsed.data;
  if (mode === "submit") {
    const completed = submittedApplicationSchema.safeParse(data);
    if (!completed.success)
      return {
        ok: false,
        message: "Complete the highlighted information before submitting.",
        fields: Object.fromEntries(
          completed.error.issues.map((i) => [i.path.join("."), i.message]),
        ),
      };
    const files = await listDocumentsForApplication(current.id);
    const missing = missingApplicationDocuments(
      data,
      current.requestedDocuments,
      files,
    );
    if (missing.length)
      return {
        ok: false,
        message: `Upload the missing documents first: ${missing.map((s) => s.documentName).join(", ")}. Save your draft before opening Documents.`,
      };
  }
  try {
    const result = await db.execute(
      studentApplicationSaveQuery({
        applicationId: current.id,
        userId: user.id,
        revision,
        mode,
        data,
        requestedDocuments: current.requestedDocuments,
      }),
    );
    const row = result.rows[0];
    if (!row)
      return {
        ok: false,
        message:
          "The application changed in another session, or its destination is already being processed. Refresh before continuing.",
      };
    for (const path of [
      "/portal",
      "/portal/application",
      "/portal/documents",
      "/admin/applications",
      "/admin/leads",
      "/admin/pipeline",
    ])
      revalidatePath(path);
    return {
      ok: true,
      revision: Number(row.revision),
      message:
        mode === "submit"
          ? "Application submitted to our admissions team. Follow updates in your tracker."
          : "Draft saved. You can continue later.",
    };
  } catch {
    return {
      ok: false,
      message:
        "We could not save your application. Your entries are still on this page; please try again.",
    };
  }
}
