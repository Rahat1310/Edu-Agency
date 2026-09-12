"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { intakeDeadlines } from "@/db/schema";
import { requireDashboardAccess, requireRole } from "@/lib/auth-helpers";
import { revalidateIntakeDeadlines } from "@/lib/intakes/revalidate";
import {
  intakeDeadlineFormSchema,
  intakeDeadlineIdSchema,
  type IntakeDeadlineFormValues,
} from "@/lib/schemas/intake-deadline";
import { validateRequest } from "@/lib/validation-helpers";

export type IntakeDeadlineActionState = {
  error?: string;
  fields?: Record<string, string[]>;
};

function toColumns(data: IntakeDeadlineFormValues) {
  return {
    destination: data.destination,
    intakeLabel: data.intakeLabel,
    applicationDeadline: data.applicationDeadline,
  };
}

function isUniqueLabelViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const record = error as { code?: string; message?: string };

  if (record.code === "23505") {
    return true;
  }

  return (
    typeof record.message === "string" &&
    record.message.includes("intake_deadlines_destination_label")
  );
}

export async function createIntakeDeadline(
  input: unknown,
): Promise<IntakeDeadlineActionState> {
  await requireDashboardAccess();

  const parsed = validateRequest(intakeDeadlineFormSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  try {
    await db.insert(intakeDeadlines).values(toColumns(parsed.data));
  } catch (error) {
    if (isUniqueLabelViolation(error)) {
      return {
        error: "That intake label already exists for this destination.",
      };
    }

    throw error;
  }

  revalidatePath("/admin/intake-deadlines");
  revalidateIntakeDeadlines();
  redirect("/admin/intake-deadlines");
}

export async function updateIntakeDeadline(
  id: string,
  input: unknown,
): Promise<IntakeDeadlineActionState> {
  await requireDashboardAccess();

  const idParsed = validateRequest(intakeDeadlineIdSchema, { id });

  if (!idParsed.success) {
    return { error: "Invalid deadline id." };
  }

  const parsed = validateRequest(intakeDeadlineFormSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  try {
    await db
      .update(intakeDeadlines)
      .set(toColumns(parsed.data))
      .where(eq(intakeDeadlines.id, idParsed.data.id));
  } catch (error) {
    if (isUniqueLabelViolation(error)) {
      return {
        error: "That intake label already exists for this destination.",
      };
    }

    throw error;
  }

  revalidatePath("/admin/intake-deadlines");
  revalidateIntakeDeadlines();
  redirect("/admin/intake-deadlines");
}

export async function deleteIntakeDeadline(
  input: unknown,
): Promise<IntakeDeadlineActionState> {
  await requireRole("admin");

  const parsed = validateRequest(intakeDeadlineIdSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db
    .delete(intakeDeadlines)
    .where(eq(intakeDeadlines.id, parsed.data.id));

  revalidatePath("/admin/intake-deadlines");
  revalidateIntakeDeadlines();
  return {};
}
