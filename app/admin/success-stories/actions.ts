"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { successStories } from "@/db/schema";
import { requireDashboardAccess, requireRole } from "@/lib/auth-helpers";
import {
  successStoryFormSchema,
  successStoryIdSchema,
  successStoryPublishSchema,
  type SuccessStoryFormValues,
} from "@/lib/schemas/success-story";
import { revalidatePublicSuccessStories } from "@/lib/success-stories/revalidate";
import { normalizeMarketingPhotoKey } from "@/lib/success-stories/photo";
import { validateRequest } from "@/lib/validation-helpers";

export type SuccessStoryActionState = {
  error?: string;
  fields?: Record<string, string[]>;
};

function toColumns(data: SuccessStoryFormValues) {
  return {
    studentName: data.studentName,
    destination: data.destination,
    university: data.university,
    program: data.program,
    quote: data.quote,
    photoR2Key: normalizeMarketingPhotoKey(data.photoR2Key) ?? null,
  };
}

export async function createSuccessStory(
  input: unknown,
): Promise<SuccessStoryActionState> {
  await requireDashboardAccess();

  const parsed = validateRequest(successStoryFormSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db.insert(successStories).values({
    ...toColumns(parsed.data),
    isPublished: false,
  });

  revalidatePath("/admin/success-stories");
  redirect("/admin/success-stories");
}

export async function updateSuccessStory(
  id: string,
  input: unknown,
): Promise<SuccessStoryActionState> {
  await requireDashboardAccess();

  const idParsed = validateRequest(successStoryIdSchema, { id });

  if (!idParsed.success) {
    return { error: "Invalid story id." };
  }

  const parsed = validateRequest(successStoryFormSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db
    .update(successStories)
    .set(toColumns(parsed.data))
    .where(eq(successStories.id, idParsed.data.id));

  revalidatePath("/admin/success-stories");
  revalidatePublicSuccessStories();
  redirect("/admin/success-stories");
}

export async function setSuccessStoryPublished(
  input: unknown,
): Promise<SuccessStoryActionState> {
  await requireDashboardAccess();

  const parsed = validateRequest(successStoryPublishSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db
    .update(successStories)
    .set({ isPublished: parsed.data.isPublished })
    .where(eq(successStories.id, parsed.data.id));

  revalidatePath("/admin/success-stories");
  revalidatePublicSuccessStories();
  return {};
}

export async function deleteSuccessStory(
  input: unknown,
): Promise<SuccessStoryActionState> {
  await requireRole("admin");

  const parsed = validateRequest(successStoryIdSchema, input);

  if (!parsed.success) {
    return { error: parsed.error.message, fields: parsed.error.fields };
  }

  await db.delete(successStories).where(eq(successStories.id, parsed.data.id));

  revalidatePath("/admin/success-stories");
  revalidatePublicSuccessStories();
  return {};
}
