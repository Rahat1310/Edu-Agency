import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Phase 1.2 roles — promote via Drizzle Studio; see docs/internal-notes.md.
export const userRoles = ["student", "counselor", "admin"] as const;

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: text("role", { enum: userRoles }).notNull().default("student"),
  // Soft-delete flag — never hard-delete user rows (CRM audit trail, Section 5.3).
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programCountries = [
  "china",
  "india",
  "malaysia",
  "south_korea",
] as const;

export const programLevels = [
  "bachelor",
  "master",
  "phd",
  "language",
  "diploma",
] as const;

export const tuitionCurrencies = ["CNY", "INR", "MYR", "KRW"] as const;

export const programs = pgTable(
  "programs",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    universityName: text("university_name").notNull(),
    country: text("country", { enum: programCountries }).notNull(),
    level: text("level", { enum: programLevels }).notNull(),
    field: text("field").notNull(),
    tuitionAmount: numeric("tuition_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),
    tuitionCurrency: text("tuition_currency", {
      enum: tuitionCurrencies,
    }).notNull(),
    intakeMonths: text("intake_months").array(),
    requirements: text("requirements"),
    scholarshipInfo: text("scholarship_info"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("programs_country_idx").on(table.country),
    index("programs_level_idx").on(table.level),
    index("programs_is_published_idx").on(table.isPublished),
  ],
);

export const leadDestinationInterests = [
  "china",
  "india",
  "malaysia",
  "south_korea",
  "undecided",
] as const;

export const leadStatuses = [
  "new",
  "contacted",
  "documents",
  "applied",
  "offer",
  "visa",
  "departed",
] as const;

export const leads = pgTable(
  "leads",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    whatsapp: text("whatsapp"),
    email: text("email"),
    destinationInterest: text("destination_interest", {
      enum: leadDestinationInterests,
    }).notNull(),
    message: text("message"),
    quizAnswers: jsonb("quiz_answers"),
    source: text("source").notNull().default("website"),
    status: text("status", { enum: leadStatuses }).notNull().default("new"),
    // Manual desk assignment (Section 5.3 / 5.8). Unassigned leads are
    // excluded from counselor performance stats.
    assignedCounselorId: uuid("assigned_counselor_id").references(
      () => users.id,
    ),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // Unfiltered desk list: ORDER BY created_at DESC LIMIT 25.
    index("leads_created_at_idx").on(table.createdAt),
    // Status filter + newest-first (also covers equality on status).
    index("leads_status_created_at_idx").on(table.status, table.createdAt),
    // Destination filter + newest-first (also covers equality on destination).
    index("leads_destination_interest_created_at_idx").on(
      table.destinationInterest,
      table.createdAt,
    ),
    index("leads_assigned_counselor_id_idx").on(table.assignedCounselorId),
    // Per-counselor performance: WHERE assigned_counselor_id = $1 AND created_at >= $2.
    index("leads_assigned_counselor_id_created_at_idx").on(
      table.assignedCounselorId,
      table.createdAt,
    ),
  ],
);

// CRM audit trail (Section 5.3). Stage moves write `stage_change`; 3.5 also reads notes.
export const leadActivityTypes = ["note", "stage_change", "system"] as const;

export const leadActivity = pgTable(
  "lead_activity",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id),
    actorUserId: uuid("actor_user_id")
      .notNull()
      .references(() => users.id),
    type: text("type", { enum: leadActivityTypes }).notNull(),
    content: text("content"),
    fromStatus: text("from_status", { enum: leadStatuses }),
    toStatus: text("to_status", { enum: leadStatuses }),
    isVisibleToStudent: boolean("is_visible_to_student")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("lead_activity_lead_id_idx").on(table.leadId),
    index("lead_activity_actor_user_id_idx").on(table.actorUserId),
    index("lead_activity_lead_id_visible_idx").on(
      table.leadId,
      table.isVisibleToStudent,
    ),
  ],
);

// One Clerk student account maps to exactly one application (and one lead) at this MVP stage.
export const applications = pgTable(
  "applications",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    // Flexible matching inputs (education, destinations, scores, budget).
    // Not a rigid profile table — eligibility criteria scoring comes later.
    profile: jsonb("profile"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("applications_user_id_idx").on(table.userId),
    uniqueIndex("applications_lead_id_idx").on(table.leadId),
  ],
);

// Multi-match phone collisions wait here until a counselor links the account by hand.
export const unlinkedAccounts = pgTable(
  "unlinked_accounts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    phone: text("phone").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [uniqueIndex("unlinked_accounts_user_id_idx").on(table.userId)],
);

export const documentTypes = [
  "transcript",
  "passport",
  "certificate",
  "bank_statement",
  "sop",
  "other",
] as const;

export const documentStatuses = ["pending", "approved", "rejected"] as const;

export const documents = pgTable(
  "documents",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id),
    // Plain text — Zod allow-list is general `documentTypes` plus every
    // `visa_requirements.document_type_key`. A Postgres enum would need a
    // migration for each destination-specific type (Section 5.4).
    type: text("type").notNull(),
    filename: text("filename").notNull(),
    r2Key: text("r2_key").notNull(),
    status: text("status", { enum: documentStatuses })
      .notNull()
      .default("pending"),
    reviewNote: text("review_note"),
    uploadedAt: timestamp("uploaded_at").defaultNow(),
  },
  (table) => [
    index("documents_application_id_idx").on(table.applicationId),
    uniqueIndex("documents_r2_key_idx").on(table.r2Key),
  ],
);

/**
 * Destination-specific visa checklist rows (Section 5.4). Unpublished rows
 * stay off the student checklist in 7.2.
 */
export const visaRequirements = pgTable(
  "visa_requirements",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    destination: text("destination", { enum: programCountries }).notNull(),
    documentName: text("document_name").notNull(),
    documentTypeKey: text("document_type_key").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    notes: text("notes"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("visa_requirements_destination_is_published_idx").on(
      table.destination,
      table.isPublished,
    ),
    uniqueIndex("visa_requirements_destination_type_key_idx").on(
      table.destination,
      table.documentTypeKey,
    ),
  ],
);

/**
 * Finer tracking inside the existing `visa` pipeline stage (Section 5.4).
 * One row per student application, created when the lead moves to `visa`.
 */
export const visaApplicationSubStatuses = [
  "preparing_documents",
  "submitted",
  "interview_scheduled",
  "approved",
  "rejected",
] as const;

export const visaApplications = pgTable(
  "visa_applications",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id),
    destination: text("destination", {
      enum: leadDestinationInterests,
    }).notNull(),
    subStatus: text("sub_status", { enum: visaApplicationSubStatuses })
      .notNull()
      .default("preparing_documents"),
    referenceNumber: text("reference_number"),
    submittedAt: timestamp("submitted_at"),
    decidedAt: timestamp("decided_at"),
    notes: text("notes"),
  },
  (table) => [
    uniqueIndex("visa_applications_application_id_idx").on(table.applicationId),
    // Visa success rate: decided rows in a date window (Section 5.3 / 5.8).
    index("visa_applications_sub_status_decided_at_idx").on(
      table.subStatus,
      table.decidedAt,
    ),
  ],
);

/**
 * Founder-editable cost bands for the public calculator.
 * Living categories are monthly. Category `tuition` is a typical *yearly*
 * figure stored in `monthlyAmount` so the column list stays as specified —
 * the calculator does not multiply tuition by 12.
 */
export const costEstimateCategories = [
  "tuition",
  "accommodation",
  "food",
  "transport",
  "misc",
] as const;

export const livingCostCategories = [
  "accommodation",
  "food",
  "transport",
  "misc",
] as const;

export const costEstimates = pgTable(
  "cost_estimates",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    destination: text("destination", { enum: programCountries }).notNull(),
    category: text("category", { enum: costEstimateCategories }).notNull(),
    monthlyAmount: numeric("monthly_amount", {
      precision: 12,
      scale: 2,
    }).notNull(),
    currency: text("currency", { enum: tuitionCurrencies }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("cost_estimates_destination_category_idx").on(
      table.destination,
      table.category,
    ),
    index("cost_estimates_destination_idx").on(table.destination),
  ],
);

export const intakeDeadlines = pgTable(
  "intake_deadlines",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    destination: text("destination", { enum: programCountries }).notNull(),
    intakeLabel: text("intake_label").notNull(),
    applicationDeadline: date("application_deadline", {
      mode: "string",
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("intake_deadlines_destination_label_idx").on(
      table.destination,
      table.intakeLabel,
    ),
    index("intake_deadlines_destination_deadline_idx").on(
      table.destination,
      table.applicationDeadline,
    ),
  ],
);

/**
 * Founder-approved public testimonials. `photoR2Key` is a public marketing
 * object key (see `lib/success-stories/photo.ts`) — not a Phase 4.4 private
 * document key. Unpublished rows stay off `/success-stories` and the home
 * featured set.
 */
export const successStories = pgTable(
  "success_stories",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    studentName: text("student_name").notNull(),
    destination: text("destination", { enum: programCountries }).notNull(),
    university: text("university").notNull(),
    program: text("program").notNull(),
    photoR2Key: text("photo_r2_key"),
    quote: text("quote").notNull(),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("success_stories_is_published_idx").on(table.isPublished),
    index("success_stories_destination_idx").on(table.destination),
  ],
);

export const aiUsageProviders = ["groq", "gemini", "openrouter"] as const;
export const aiUsageTasks = ["chat", "matching"] as const;

export const aiUsageLog = pgTable(
  "ai_usage_log",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    provider: text("provider", { enum: aiUsageProviders }).notNull(),
    task: text("task", { enum: aiUsageTasks }).notNull(),
    tokensIn: integer("tokens_in").notNull().default(0),
    tokensOut: integer("tokens_out").notNull().default(0),
    success: boolean("success").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("ai_usage_log_provider_created_at_idx").on(
      table.provider,
      table.createdAt,
    ),
  ],
);

/**
 * Idempotent intake-deadline reminders (Section 7: batch on a schedule).
 * One row per application / deadline / window so a rerun never double-sends.
 */
export const remindersSent = pgTable(
  "reminders_sent",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id),
    deadlineId: uuid("deadline_id")
      .notNull()
      .references(() => intakeDeadlines.id),
    window: integer("window").notNull(),
    sentAt: timestamp("sent_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reminders_sent_application_deadline_window_idx").on(
      table.applicationId,
      table.deadlineId,
      table.window,
    ),
    index("reminders_sent_application_id_idx").on(table.applicationId),
    index("reminders_sent_deadline_id_idx").on(table.deadlineId),
  ],
);

export const messageDirections = ["inbound", "outbound"] as const;
export const messageChannels = ["whatsapp", "messenger", "email"] as const;
export const threadChannels = ["whatsapp", "messenger"] as const;

/**
 * WhatsApp / Messenger thread plus nurture email outbound (Section 5.6 / 6.1 / 6.2).
 * `leadId` is null when the inbound sender could not be matched — those rows
 * sit in the unmatched-messages queue until a counselor links them.
 * `externalSenderId` is WhatsApp digits or a Messenger PSID.
 */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    leadId: uuid("lead_id").references(() => leads.id),
    direction: text("direction", { enum: messageDirections }).notNull(),
    channel: text("channel", { enum: messageChannels }).notNull(),
    body: text("body"),
    externalSenderId: text("external_sender_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("messages_lead_id_idx").on(table.leadId),
    index("messages_lead_id_created_at_idx").on(table.leadId, table.createdAt),
    index("messages_lead_id_direction_created_at_idx").on(
      table.leadId,
      table.direction,
      table.createdAt,
    ),
    index("messages_unmatched_created_at_idx")
      .on(table.createdAt)
      .where(sql`${table.leadId} is null`),
    index("messages_external_sender_id_idx")
      .on(table.externalSenderId)
      .where(sql`${table.externalSenderId} is not null`),
  ],
);

/**
 * Idempotent nurture steps. One row per lead / step so a rerun never
 * double-sends. Desk history still lives on lead_activity.
 */
export const nurtureSends = pgTable(
  "nurture_sends",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id),
    stepId: text("step_id").notNull(),
    channel: text("channel", { enum: messageChannels }).notNull(),
    sentAt: timestamp("sent_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("nurture_sends_lead_id_step_id_idx").on(
      table.leadId,
      table.stepId,
    ),
    index("nurture_sends_lead_id_idx").on(table.leadId),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = (typeof userRoles)[number];
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
export type ProgramCountry = (typeof programCountries)[number];
export type ProgramLevel = (typeof programLevels)[number];
export type TuitionCurrency = (typeof tuitionCurrencies)[number];
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type LeadDestinationInterest = (typeof leadDestinationInterests)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type LeadActivity = typeof leadActivity.$inferSelect;
export type NewLeadActivity = typeof leadActivity.$inferInsert;
export type LeadActivityType = (typeof leadActivityTypes)[number];
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type UnlinkedAccount = typeof unlinkedAccounts.$inferSelect;
export type NewUnlinkedAccount = typeof unlinkedAccounts.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type GeneralDocumentType = (typeof documentTypes)[number];
export type DocumentType = string;
export type DocumentStatus = (typeof documentStatuses)[number];
export type VisaRequirement = typeof visaRequirements.$inferSelect;
export type NewVisaRequirement = typeof visaRequirements.$inferInsert;
export type VisaApplication = typeof visaApplications.$inferSelect;
export type NewVisaApplication = typeof visaApplications.$inferInsert;
export type VisaApplicationSubStatus =
  (typeof visaApplicationSubStatuses)[number];
export type CostEstimate = typeof costEstimates.$inferSelect;
export type NewCostEstimate = typeof costEstimates.$inferInsert;
export type CostEstimateCategory = (typeof costEstimateCategories)[number];
export type LivingCostCategory = (typeof livingCostCategories)[number];
export type IntakeDeadline = typeof intakeDeadlines.$inferSelect;
export type NewIntakeDeadline = typeof intakeDeadlines.$inferInsert;
export type SuccessStory = typeof successStories.$inferSelect;
export type NewSuccessStory = typeof successStories.$inferInsert;
export type AiUsageLog = typeof aiUsageLog.$inferSelect;
export type NewAiUsageLog = typeof aiUsageLog.$inferInsert;
export type AiUsageProvider = (typeof aiUsageProviders)[number];
export type AiUsageTask = (typeof aiUsageTasks)[number];
export type ReminderSent = typeof remindersSent.$inferSelect;
export type NewReminderSent = typeof remindersSent.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MessageDirection = (typeof messageDirections)[number];
export type MessageChannel = (typeof messageChannels)[number];
export type ThreadChannel = (typeof threadChannels)[number];
export type NurtureSend = typeof nurtureSends.$inferSelect;
export type NewNurtureSend = typeof nurtureSends.$inferInsert;
