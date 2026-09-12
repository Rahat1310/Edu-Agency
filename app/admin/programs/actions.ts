"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { programs } from "@/db/schema";
import { requireDashboardAccess, requireRole } from "@/lib/auth-helpers";
import { revalidatePublicPrograms } from "@/lib/programs-revalidate";
import {
  programFormSchema,
  programIdSchema,
  programPublishSchema,
  type ProgramFormValues,
} from "@/lib/schemas/program";
import { validateRequest } from "@/lib/validation-helpers";

export type ProgramActionState = {
  error?: string;
  fields?: Record<string, string[]>;
};

function toProgramColumns(data: ProgramFormValues) {
  return {
    universityName: data.universityName,
    country: data.country,
    level: data.level,
    field: data.field,
    tuitionAmount: data.tuitionAmount.toFixed(2),
    tuitionCurrency: data.tuitionCurrency,
    intakeMonths: data.intakeMonths,
    requirements: data.requirements.length > 0 ? data.requirements : null,
    scholarshipInfo:
      data.scholarshipInfo.length > 0 ? data.scholarshipInfo : null,
    updatedAt: new Date(),
  };
}

export async function createProgram(
  input: unknown,
): Promise<ProgramActionState> {
  await requireDashboardAccess();

  const parsed = validateRequest(programFormSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db.insert(programs).values({
    ...toProgramColumns(parsed.data),
    isPublished: false,
  });

  revalidatePath("/admin/programs");
  redirect("/admin/programs");
}

export async function updateProgram(
  id: string,
  input: unknown,
): Promise<ProgramActionState> {
  await requireDashboardAccess();

  const idParsed = validateRequest(programIdSchema, { id });

  if (!idParsed.success) {
    return { error: "Invalid program id." };
  }

  const parsed = validateRequest(programFormSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db
    .update(programs)
    .set(toProgramColumns(parsed.data))
    .where(eq(programs.id, idParsed.data.id));

  revalidatePath("/admin/programs");
  revalidatePublicPrograms(idParsed.data.id);
  redirect("/admin/programs");
}

export async function setProgramPublished(
  input: unknown,
): Promise<ProgramActionState> {
  await requireDashboardAccess();

  const parsed = validateRequest(programPublishSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db
    .update(programs)
    .set({
      isPublished: parsed.data.isPublished,
      updatedAt: new Date(),
    })
    .where(eq(programs.id, parsed.data.id));

  revalidatePath("/admin/programs");
  revalidatePublicPrograms(parsed.data.id);
  return {};
}

export async function deleteProgram(
  input: unknown,
): Promise<ProgramActionState> {
  await requireRole("admin");

  const parsed = validateRequest(programIdSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db.delete(programs).where(eq(programs.id, parsed.data.id));

  revalidatePath("/admin/programs");
  revalidatePublicPrograms(parsed.data.id);
  return {};
}
