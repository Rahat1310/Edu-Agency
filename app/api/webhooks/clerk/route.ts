import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const clerkEmailSchema = z.object({
  id: z.string(),
  email_address: z.string(),
});

const clerkUserSchema = z.object({
  id: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  primary_email_address_id: z.string().nullable().optional(),
  email_addresses: z.array(clerkEmailSchema).optional(),
});

const clerkDeletedUserSchema = z.object({
  id: z.string(),
});

const clerkEventSchema = z.object({
  type: z.string(),
  data: z.unknown(),
});

function fullNameFromClerkUser(
  data: z.infer<typeof clerkUserSchema>,
): string | null {
  const name = [data.first_name, data.last_name]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .trim();

  return name.length > 0 ? name : null;
}

function emailFromClerkUser(data: z.infer<typeof clerkUserSchema>): string {
  const emails = data.email_addresses ?? [];
  const primary =
    emails.find((email) => email.id === data.primary_email_address_id) ??
    emails[0];

  return primary?.email_address ?? "";
}

export async function POST(request: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing webhook signature headers", { status: 400 });
  }

  const payload = await request.text();
  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let verified: unknown;

  try {
    verified = webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const parsedEvent = clerkEventSchema.safeParse(verified);

  if (!parsedEvent.success) {
    return new Response("Invalid webhook payload", { status: 400 });
  }

  const { type, data } = parsedEvent.data;

  if (type === "user.created") {
    const user = clerkUserSchema.safeParse(data);

    if (!user.success) {
      return new Response("Invalid user.created payload", { status: 400 });
    }

    const email = emailFromClerkUser(user.data);

    if (!email) {
      return new Response("user.created payload is missing an email address", {
        status: 400,
      });
    }

    const fullName = fullNameFromClerkUser(user.data);

    await db
      .insert(users)
      .values({
        clerkId: user.data.id,
        email,
        fullName,
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email,
          fullName,
          isActive: true,
          updatedAt: new Date(),
        },
      });

    return new Response("OK", { status: 200 });
  }

  if (type === "user.updated") {
    const user = clerkUserSchema.safeParse(data);

    if (!user.success) {
      return new Response("Invalid user.updated payload", { status: 400 });
    }

    const email = emailFromClerkUser(user.data);
    const fullName = fullNameFromClerkUser(user.data);

    await db
      .update(users)
      .set({
        ...(email ? { email } : {}),
        fullName,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, user.data.id));

    return new Response("OK", { status: 200 });
  }

  if (type === "user.deleted") {
    const deleted = clerkDeletedUserSchema.safeParse(data);

    if (!deleted.success) {
      return new Response("Invalid user.deleted payload", { status: 400 });
    }

    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, deleted.data.id));

    return new Response("OK", { status: 200 });
  }

  return new Response("OK", { status: 200 });
}
