"use server";

import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { visaRequirements } from "@/db/schema";
import { requireDashboardAccess, requireRole } from "@/lib/auth-helpers";
import {
  visaRequirementFormSchema,
  visaRequirementIdSchema,
  visaRequirementMoveSchema,
  visaRequirementPublishSchema,
  type VisaRequirementFormValues,
} from "@/lib/schemas/visa-requirement";
import { validateRequest } from "@/lib/validation-helpers";
import { revalidateVisaRequirements } from "@/lib/visa-requirements/revalidate";

export type VisaRequirementActionState = {
  error?: string;
  fields?: Record<string, string[]>;
};

function toColumns(data: VisaRequirementFormValues) {
  return {
    destination: data.destination,
    documentName: data.documentName,
    documentTypeKey: data.documentTypeKey,
    description: data.description.length > 0 ? data.description : null,
    notes: data.notes.length > 0 ? data.notes : null,
    sortOrder: data.sortOrder,
    updatedAt: new Date(),
  };
}

function isUniqueKeyViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const record = error as { code?: string; message?: string };

  if (record.code === "23505") {
    return true;
  }

  return (
    typeof record.message === "string" &&
    record.message.includes("visa_requirements_destination_type_key")
  );
}

export async function createVisaRequirement(
  input: unknown,
): Promise<VisaRequirementActionState> {
  await requireDashboardAccess();

  const parsed = validateRequest(visaRequirementFormSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  try {
    await db.insert(visaRequirements).values({
      ...toColumns(parsed.data),
      isPublished: false,
    });
  } catch (error) {
    if (isUniqueKeyViolation(error)) {
      return {
        error:
          "That document type key already exists for this destination. Pick another slug.",
      };
    }

    throw error;
  }

  revalidateVisaRequirements();
  redirect("/admin/visa-requirements");
}

export async function updateVisaRequirement(
  id: string,
  input: unknown,
): Promise<VisaRequirementActionState> {
  await requireDashboardAccess();

  const idParsed = validateRequest(visaRequirementIdSchema, { id });

  if (!idParsed.success) {
    return { error: "Invalid requirement id." };
  }

  const parsed = validateRequest(visaRequirementFormSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  try {
    await db
      .update(visaRequirements)
      .set(toColumns(parsed.data))
      .where(eq(visaRequirements.id, idParsed.data.id));
  } catch (error) {
    if (isUniqueKeyViolation(error)) {
      return {
        error:
          "That document type key already exists for this destination. Pick another slug.",
      };
    }

    throw error;
  }

  revalidateVisaRequirements();
  redirect("/admin/visa-requirements");
}

export async function setVisaRequirementPublished(
  input: unknown,
): Promise<VisaRequirementActionState> {
  await requireDashboardAccess();

  const parsed = validateRequest(visaRequirementPublishSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db
    .update(visaRequirements)
    .set({ isPublished: parsed.data.isPublished, updatedAt: new Date() })
    .where(eq(visaRequirements.id, parsed.data.id));

  revalidateVisaRequirements();
  return {};
}

export async function moveVisaRequirement(
  input: unknown,
): Promise<VisaRequirementActionState> {
  await requireDashboardAccess();

  const parsed = validateRequest(visaRequirementMoveSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  const [row] = await db
    .select({
      id: visaRequirements.id,
      destination: visaRequirements.destination,
    })
    .from(visaRequirements)
    .where(eq(visaRequirements.id, parsed.data.id))
    .limit(1);

  if (!row) {
    return { error: "That requirement is no longer on the desk." };
  }

  const siblings = await db
    .select({
      id: visaRequirements.id,
      sortOrder: visaRequirements.sortOrder,
    })
    .from(visaRequirements)
    .where(eq(visaRequirements.destination, row.destination))
    .orderBy(asc(visaRequirements.sortOrder), asc(visaRequirements.documentName));

  const index = siblings.findIndex((item) => item.id === row.id);
  const swapWith =
    parsed.data.direction === "up"
      ? siblings[index - 1]
      : siblings[index + 1];

  if (index < 0 || !swapWith) {
    return {};
  }

  const ordered = siblings.slice();
  const neighborIndex = parsed.data.direction === "up" ? index - 1 : index + 1;
  const current = ordered[index];
  if (!current || neighborIndex < 0 || neighborIndex >= ordered.length) {
    return {};
  }

  ordered[index] = swapWith;
  ordered[neighborIndex] = current;

  const now = new Date();

  for (const [sortOrder, item] of ordered.entries()) {
    if (!item) {
      continue;
    }

    await db
      .update(visaRequirements)
      .set({ sortOrder, updatedAt: now })
      .where(eq(visaRequirements.id, item.id));
  }

  revalidateVisaRequirements();
  return {};
}

export async function deleteVisaRequirement(
  input: unknown,
): Promise<VisaRequirementActionState> {
  await requireRole("admin");

  const parsed = validateRequest(visaRequirementIdSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db
    .delete(visaRequirements)
    .where(eq(visaRequirements.id, parsed.data.id));

  revalidateVisaRequirements();
  return {};
}
