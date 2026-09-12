import "server-only";

import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  leadActivity,
  leads,
  unlinkedAccounts,
  users,
} from "@/db/schema";
import {
  findLeadsByPhone,
  findLeadsByPhoneDigits,
  loadStudentApplicationByUserId,
  type StudentLead,
} from "@/lib/leads/link-student";
import { phoneDigitVariants, phonesMatch } from "@/lib/phone";
import { LEAD_SOURCE_SELF_SIGNUP } from "@/lib/schemas/lead";
import type { ResolveUnlinkedInput } from "@/lib/schemas/portal";
import { ensureVisaApplicationForLead } from "@/lib/visa-applications/ensure";

export type UnlinkedMatch = StudentLead & {
  linkedUserId: string | null;
};

export type UnlinkedQueueRow = {
  id: string;
  userId: string;
  phone: string;
  createdAt: string | null;
  email: string;
  fullName: string | null;
  matches: UnlinkedMatch[];
};

const QUEUE_CAP = 100;

export async function listUnlinkedAccounts(): Promise<UnlinkedQueueRow[]> {
  const rows = await db
    .select({
      id: unlinkedAccounts.id,
      userId: unlinkedAccounts.userId,
      phone: unlinkedAccounts.phone,
      createdAt: unlinkedAccounts.createdAt,
      email: users.email,
      fullName: users.fullName,
    })
    .from(unlinkedAccounts)
    .innerJoin(users, eq(users.id, unlinkedAccounts.userId))
    .orderBy(desc(unlinkedAccounts.createdAt), desc(unlinkedAccounts.id))
    .limit(QUEUE_CAP);

  if (rows.length === 0) {
    return [];
  }

  const candidates = await findLeadsByPhoneDigits([
    ...new Set(rows.flatMap((row) => phoneDigitVariants(row.phone))),
  ]);

  const leadIds = [...new Set(candidates.map((lead) => lead.id))];

  const owners = new Map<string, string>();

  if (leadIds.length > 0) {
    const linked = await db
      .select({
        leadId: applications.leadId,
        userId: applications.userId,
      })
      .from(applications)
      .where(inArray(applications.leadId, leadIds));

    for (const row of linked) {
      owners.set(row.leadId, row.userId);
    }
  }

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
    matches: candidates
      .filter((lead) => phonesMatch(row.phone, lead.phone))
      .map((lead) => ({
        ...lead,
        linkedUserId: owners.get(lead.id) ?? null,
      })),
  }));
}

export type ResolveUnlinkedResult =
  { ok: true } | { ok: false; message: string };

async function recordResolveActivity(
  leadId: string,
  actorUserId: string,
  content: string,
) {
  try {
    await db.insert(leadActivity).values({
      leadId,
      actorUserId,
      type: "system",
      content,
      fromStatus: null,
      toStatus: null,
    });
  } catch {
    // The link still stands if the audit row cannot be written.
  }
}

function displayName(fullName: string | null, email: string): string {
  const trimmed = fullName?.trim();
  if (trimmed) {
    return trimmed;
  }

  const local = email.split("@")[0]?.trim();
  return local && local.length > 0 ? local : "Student";
}

export async function resolveUnlinkedAccount(input: {
  payload: ResolveUnlinkedInput;
  actorUserId: string;
}): Promise<ResolveUnlinkedResult> {
  const [pending] = await db
    .select({
      id: unlinkedAccounts.id,
      userId: unlinkedAccounts.userId,
      phone: unlinkedAccounts.phone,
      email: users.email,
      fullName: users.fullName,
    })
    .from(unlinkedAccounts)
    .innerJoin(users, eq(users.id, unlinkedAccounts.userId))
    .where(eq(unlinkedAccounts.id, input.payload.unlinkedAccountId))
    .limit(1);

  if (!pending) {
    return {
      ok: false,
      message: "That queue item is no longer waiting. Refresh and try again.",
    };
  }

  const already = await loadStudentApplicationByUserId(pending.userId);
  if (already) {
    await db
      .delete(unlinkedAccounts)
      .where(eq(unlinkedAccounts.id, pending.id));
    return { ok: true };
  }

  const payload = input.payload;
  let leadId: string;

  if (payload.action === "create") {
    const [created] = await db
      .insert(leads)
      .values({
        name: displayName(pending.fullName, pending.email),
        phone: pending.phone,
        email: pending.email,
        destinationInterest: "undecided",
        source: LEAD_SOURCE_SELF_SIGNUP,
        status: "new",
      })
      .returning({ id: leads.id });

    if (!created) {
      return {
        ok: false,
        message: "Could not create a pipeline record. Try again.",
      };
    }

    leadId = created.id;
  } else {
    const matches = await findLeadsByPhone(pending.phone);
    const match = matches.find((lead) => lead.id === payload.leadId);

    if (!match) {
      return {
        ok: false,
        message:
          "That lead does not match this phone number, so it was not linked.",
      };
    }

    leadId = match.id;
  }

  const [owner] = await db
    .select({ userId: applications.userId })
    .from(applications)
    .where(eq(applications.leadId, leadId))
    .limit(1);

  if (owner && owner.userId !== pending.userId) {
    return {
      ok: false,
      message: "That lead is already linked to a different student account.",
    };
  }

  const [application] = await db
    .insert(applications)
    .values({ leadId, userId: pending.userId })
    .onConflictDoNothing()
    .returning({ id: applications.id });

  if (!application) {
    const after = await loadStudentApplicationByUserId(pending.userId);
    if (!after) {
      return {
        ok: false,
        message: "Could not link that account. The lead may already be taken.",
      };
    }
  } else {
    await recordResolveActivity(
      leadId,
      input.actorUserId,
      "Counselor linked this student account from the unlinked-accounts queue.",
    );
  }

  await ensureVisaApplicationForLead(leadId);

  await db.delete(unlinkedAccounts).where(eq(unlinkedAccounts.id, pending.id));

  return { ok: true };
}
