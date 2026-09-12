import "server-only";

import { eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  applications,
  leadActivity,
  leads,
  unlinkedAccounts,
  type LeadDestinationInterest,
  type LeadStatus,
} from "@/db/schema";
import { phoneDigitVariants } from "@/lib/phone";
import { LEAD_SOURCE_SELF_SIGNUP } from "@/lib/schemas/lead";
import { ensureVisaApplicationForLead } from "@/lib/visa-applications/ensure";

const leadColumns = {
  id: leads.id,
  name: leads.name,
  phone: leads.phone,
  email: leads.email,
  destinationInterest: leads.destinationInterest,
  status: leads.status,
  source: leads.source,
  quizAnswers: leads.quizAnswers,
  createdAt: leads.createdAt,
} as const;

export type StudentLead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  destinationInterest: LeadDestinationInterest;
  status: LeadStatus;
  source: string;
  quizAnswers: unknown;
  createdAt: string | null;
};

export type StudentApplicationRow = {
  id: string;
  leadId: string;
  userId: string;
  profile: unknown;
  createdAt: string | null;
};

export type LinkedStudentApplication = {
  application: StudentApplicationRow;
  lead: StudentLead;
};

export type StudentLinkInput = {
  user: { id: string; email: string; fullName: string | null };
  phone: string | null;
};

export type StudentLinkResult =
  | ({ status: "linked" } & LinkedStudentApplication)
  | { status: "pending" }
  | { status: "need_phone" };

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function toStudentLead(row: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  destinationInterest: LeadDestinationInterest;
  status: LeadStatus;
  source: string;
  quizAnswers: unknown;
  createdAt: Date | null;
}): StudentLead {
  return {
    ...row,
    createdAt: toIso(row.createdAt),
  };
}

function phoneDigitsInSql(variants: string[]) {
  if (variants.length === 0) {
    return sql`false`;
  }

  const list = sql.join(
    variants.map((variant) => sql`${variant}`),
    sql`, `,
  );

  return sql`regexp_replace(coalesce(${leads.phone}, ''), '[^0-9]', '', 'g') in (${list})`;
}

export async function findLeadsByPhoneDigits(
  variants: string[],
): Promise<StudentLead[]> {
  if (variants.length === 0) {
    return [];
  }

  const rows = await db
    .select(leadColumns)
    .from(leads)
    .where(phoneDigitsInSql(variants))
    .limit(500);

  return rows.map(toStudentLead);
}

export async function findLeadsByPhone(phone: string): Promise<StudentLead[]> {
  return findLeadsByPhoneDigits(phoneDigitVariants(phone));
}

export async function loadStudentApplicationByUserId(
  userId: string,
): Promise<LinkedStudentApplication | null> {
  const [row] = await db
    .select({
      applicationId: applications.id,
      applicationLeadId: applications.leadId,
      applicationUserId: applications.userId,
      applicationCreatedAt: applications.createdAt,
      applicationProfile: applications.profile,
      leadId: leads.id,
      leadName: leads.name,
      leadPhone: leads.phone,
      leadEmail: leads.email,
      leadDestinationInterest: leads.destinationInterest,
      leadStatus: leads.status,
      leadSource: leads.source,
      leadQuizAnswers: leads.quizAnswers,
      leadCreatedAt: leads.createdAt,
    })
    .from(applications)
    .innerJoin(leads, eq(leads.id, applications.leadId))
    .where(eq(applications.userId, userId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    application: {
      id: row.applicationId,
      leadId: row.applicationLeadId,
      userId: row.applicationUserId,
      profile: row.applicationProfile,
      createdAt: toIso(row.applicationCreatedAt),
    },
    lead: {
      id: row.leadId,
      name: row.leadName,
      phone: row.leadPhone,
      email: row.leadEmail,
      destinationInterest: row.leadDestinationInterest,
      status: row.leadStatus,
      source: row.leadSource,
      quizAnswers: row.leadQuizAnswers,
      createdAt: toIso(row.leadCreatedAt),
    },
  };
}

async function linkedUserByLeadId(
  leadIds: string[],
): Promise<Map<string, string>> {
  if (leadIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      leadId: applications.leadId,
      userId: applications.userId,
    })
    .from(applications)
    .where(inArray(applications.leadId, leadIds));

  return new Map(rows.map((row) => [row.leadId, row.userId]));
}

async function enqueueUnlinked(userId: string, phone: string) {
  await db
    .insert(unlinkedAccounts)
    .values({ userId, phone })
    .onConflictDoNothing({ target: unlinkedAccounts.userId });
}

async function recordSystemActivity(
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
    // Linking still stands if the audit row cannot be written.
  }
}

async function insertApplication(
  leadId: string,
  userId: string,
): Promise<StudentApplicationRow | null> {
  const [row] = await db
    .insert(applications)
    .values({ leadId, userId })
    .onConflictDoNothing()
    .returning({
      id: applications.id,
      leadId: applications.leadId,
      userId: applications.userId,
      profile: applications.profile,
      createdAt: applications.createdAt,
    });

  return row
    ? {
        id: row.id,
        leadId: row.leadId,
        userId: row.userId,
        profile: row.profile,
        createdAt: toIso(row.createdAt),
      }
    : null;
}

function leadNameForUser(user: StudentLinkInput["user"]): string {
  const fullName = user.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  const local = user.email.split("@")[0]?.trim();
  return local && local.length > 0 ? local : "Student";
}

async function insertSelfSignupLead(
  user: StudentLinkInput["user"],
  phone: string,
): Promise<StudentLead> {
  const [row] = await db
    .insert(leads)
    .values({
      name: leadNameForUser(user),
      phone,
      email: user.email,
      destinationInterest: "undecided",
      source: LEAD_SOURCE_SELF_SIGNUP,
      status: "new",
    })
    .returning(leadColumns);

  if (!row) {
    throw new Error("Failed to create a pipeline record for self-signup.");
  }

  return toStudentLead(row);
}

async function alreadyQueued(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: unlinkedAccounts.id })
    .from(unlinkedAccounts)
    .where(eq(unlinkedAccounts.userId, userId))
    .limit(1);

  return Boolean(row);
}

/**
 * Idempotent link from a student account to a leads row. Runs on first
 * `/portal` visit — not in the Clerk webhook.
 */
export async function syncStudentApplicationLink(
  input: StudentLinkInput,
): Promise<StudentLinkResult> {
  const existing = await loadStudentApplicationByUserId(input.user.id);
  if (existing) {
    return { status: "linked", ...existing };
  }

  if (await alreadyQueued(input.user.id)) {
    return { status: "pending" };
  }

  const phone = input.phone?.trim() ?? "";
  if (!phone || phoneDigitVariants(phone).length === 0) {
    return { status: "need_phone" };
  }

  const matches = await findLeadsByPhone(phone);
  const owners = await linkedUserByLeadId(matches.map((match) => match.id));
  const match = matches.length === 1 ? matches[0] : undefined;

  if (matches.length > 1) {
    await enqueueUnlinked(input.user.id, phone);
    return { status: "pending" };
  }

  if (match) {
    const owner = owners.get(match.id);

    if (owner && owner !== input.user.id) {
      await enqueueUnlinked(input.user.id, phone);
      return { status: "pending" };
    }

    const application = await insertApplication(match.id, input.user.id);
    if (!application) {
      const after = await loadStudentApplicationByUserId(input.user.id);
      if (after) {
        return { status: "linked", ...after };
      }

      await enqueueUnlinked(input.user.id, phone);
      return { status: "pending" };
    }

    await recordSystemActivity(
      match.id,
      input.user.id,
      "Student account linked to this inquiry.",
    );

    await ensureVisaApplicationForLead(match.id);

    return { status: "linked", application, lead: match };
  }

  const lead = await insertSelfSignupLead(input.user, phone);
  const application = await insertApplication(lead.id, input.user.id);

  if (!application) {
    const after = await loadStudentApplicationByUserId(input.user.id);
    if (after) {
      return { status: "linked", ...after };
    }

    await enqueueUnlinked(input.user.id, phone);
    return { status: "pending" };
  }

  await recordSystemActivity(
    lead.id,
    input.user.id,
    "Student signed up without an existing inquiry. Pipeline record created.",
  );

  return { status: "linked", application, lead };
}

export function phoneFromClerkUser(
  user: {
    primaryPhoneNumberId: string | null;
    phoneNumbers: { id: string; phoneNumber: string }[];
  } | null,
): string | null {
  if (!user) {
    return null;
  }

  const numbers = user.phoneNumbers ?? [];
  const primary =
    numbers.find((entry) => entry.id === user.primaryPhoneNumberId) ??
    numbers[0];
  const raw = primary?.phoneNumber?.trim();

  return raw && phoneDigitVariants(raw).length > 0 ? raw : null;
}
