# Student assessment implementation and deployment

## Repository audit and integration

Next.js 15.5.23 App Router / React 19, Tailwind 4 and shared marketing layout; English public URLs rewrite into `/en`, Bangla uses `/bn`. Existing Neon PostgreSQL/Drizzle, Clerk (`admin`/`counselor` active database roles), Resend transactional email, official Meta WhatsApp Cloud API, Inngest schedules, Turnstile and Upstash are reused. No Brevo integration was present. Existing contact, homepage evaluation and eligibility submissions remain on their existing endpoints. Existing CRM stages are preserved: assessment follow-up uses `leads.assessment_status` separately to avoid breaking visa/application pipelines. All records use the same `leads` table and stable staff user IDs.

## Routes and changed CTAs

- `/consultation`, `/bn/consultation`: four steps and explicit review; confirmation only in component memory (no public lookup or personal URL).
- `POST /api/consultation`: bounded 24KB JSON, same-origin, server validation, honeypot, existing rate limiter and configured Turnstile verification. Opaque UUID retry key plus SHA-256 payload binding. The client cannot set assignment/reference/status.
- `/admin/leads`: authenticated assessments with search, date/destination/status/counsellor filters, counts, pagination.
- `/admin/leads/[id]`: full assessment, private notes, status, reassignment, follow-up and outbox inspection/retry.
- `/admin/leads?view=legacy`: existing enquiries/CRM; existing pipeline stages and student portal remain intact.
- Navbar desktop/mobile consultation buttons, homepage hero and consultation section, homepage/about profile assessment buttons and journey roadmap consultation CTA now use `/consultation`. Contact nav remains `/contact`; quiz remains separate. Contact page links to detailed assessment. Footer keeps existing general enquiry links.

## Database migration (additive; review before production)

Run `npm run db:migrate` against a **staging branch first**, with the existing database URL settings. Migration `0020_youthful_human_torch.sql` adds assessment JSON, unique reference, unique submission key/hash, consent, follow-up/status/update fields to leads. It adds `counselor_profiles` extending existing staff user IDs and `assessment_outbox`. A PostgreSQL sequence generates concurrent-safe references; sequence gaps are expected, including retries. An AFTER INSERT trigger creates email/WhatsApp jobs atomically with an assessment lead. An index enforces exactly one default auto-assignment profile. RLS enabled on new private tables; runtime uses a trusted server database owner. Do not expose this credential to the browser. If using a non-owner role, grant required server privileges and explicit policies; anonymous roles must have no access to student records, including existing leads.

The migration is additive and preserves existing records. Migration `0020_youthful_human_torch` was applied to the configured database during the 2026-11-05 save fix; other deployment databases must apply it separately. Drizzle generation is not deployment. Do not use `db:push` in production. Back up production and review migrations before applying. Rollback requires stopping intake and deliberate removal of trigger/function/added objects; do not drop tables with retained records.

## Counsellor setup

New assessments save a server-owned `assignedCounselor` contact snapshot inside assessment JSON. The agency-designated default is MD DIDARUL ISLAM NISHAD, Senior Student Counsellor, +8801765926697 (phone and WhatsApp), configured in `lib/consultation/counsellor.ts`. This assigns the supplied student-facing contact even before a staff login is linked. An active auto-assignment staff profile takes precedence. Client-provided assignment is stripped by validation. Contact details appear only on the confirmation screen after successful persistence, with call and WhatsApp buttons.

To also link assessments to a real staff login for CRM filters and staff reporting:

1. Create/sign in the genuine staff account through existing Clerk setup. Promote the database user to active `counselor` or `admin` using existing `make-admin`/staff administration. Do not put untrusted addresses in `ADMIN_EMAILS`.
2. Set `COUNSELLOR_FULL_NAME`, `COUNSELLOR_PHONE`, `COUNSELLOR_WHATSAPP`, `COUNSELLOR_TITLE`, `COUNSELLOR_WORK_EMAIL` (must match that staff account). The sample name, title and phone numbers use the supplied counsellor details.
3. Run `npx tsx --env-file=.env.local scripts/setup-assessment-counselor.ts`. This upserts by stable staff ID. It rejects missing/fake details and invalid phone numbers. The default title is Student Admissions Counsellor.
4. `active` controls availability; `auto_assign` selects the **one** default contact. Other profiles may be added later for manual reassignment without changing old assignments. To change default, disable the former auto_assign flag in a controlled DB transaction before enabling another profile. No random/round-robin algorithm.

Missing/inactive staff profile: keep `assigned_counselor_id` empty and save the agency-designated contact snapshot. No staff login is created or granted access. Legacy assessments without a contact snapshot or linked profile retain the pending-assignment fallback. The form is not a booked appointment. Existing linked staff assignments remain stable even if a profile becomes inactive.

## Email activation

Brevo is now supported by the shared transactional sender and takes precedence
when `BREVO_API_KEY` is configured. Set `EMAIL_FROM` to your Brevo-verified sender,
for example `Study Abroad Consultant <support@your-domain.com>`. Optionally set
`EMAIL_REPLY_TO` to the mailbox you read in Gmail. Use a Brevo **API key**, not the
SMTP key used for Gmail's Send as configuration. Gmail can continue handling
manual replies; the website calls Brevo directly. The example environment file
contains these settings. No real Brevo message has been sent or verified.

Brevo uses a stable IdempotencyKey for each queued notification, but provider
deduplication has a limited lifetime. Timeouts, server errors and unreadable
acceptance responses go to manual review for consultation jobs rather than being
blindly resent. Accepted means provider acceptance, not confirmed inbox delivery.
Existing Resend deployments still work when no Brevo key is configured; a failed
Brevo send does not fall back to another provider. The historical Resend setup
notes below apply only to that alternative configuration.

Student copies: new submissions with an email address also enqueue a separate
`student_email` outbox job in the same SQL statement as the lead insert. The
lead/channel unique index prevents duplicate jobs on submission retries. The
student and office emails are processed independently after the response and by
the existing scheduled worker. No database migration is needed; channel is text.
Older submissions are not backfilled or emailed automatically.

The student email contains the reference and counsellor contact snapshot, without
academic answers or private admin links. The confirmation page also offers a
client-side `.txt` download of these details, even without an email address or
email configuration. It reports queued email as queued, not delivered, and shows
an unavailable notice when sender configuration is missing. Email remains optional.
These receipts do not link an anonymous assessment to a student login or add
account-based retrieval. No confirmation data is stored in browser local storage.

After a successful save, Next.js `after()` starts the current assessment's email job immediately. Email failure does not undo the saved answers or hide the confirmation. The worker claims only that lead's email job, so submitting the form cannot send unrelated queued notifications. Inngest remains the durable retry mechanism for temporary failures and interrupted jobs.

Set `RESEND_API_KEY` and `EMAIL_FROM` to a verified sender/domain in the existing Resend account. Recipient is fixed to `support@studyabroadconsultantbd.com`. The structured plaintext and escaped HTML include the complete assessment, consent/source, Dhaka time, assigned contact and protected admin link. Set a real HTTPS `NEXT_PUBLIC_APP_URL`. Resend idempotency keys are stable per job. Provider request acceptance is recorded as `accepted`, never represented as confirmed inbox delivery. Missing keys record `configuration_required` (not a successful dry run). No actual delivery has been tested with live credentials.

## WhatsApp activation

Reuse the existing Meta Business account and official Cloud API. Configure `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and the agency-authorised **business recipient** `ASSESSMENT_WHATSAPP_RECIPIENT` in international format. This recipient is deliberately independent from public website click-to-chat numbers. Complete Meta account verification/permissions/payment requirements as applicable; obtain the recipient's applicable permission.

Approve an agency-alert template in WhatsApp Manager with five positional BODY parameters, in this exact order:

1. Lead reference
2. Preferred country
3. Intended degree
4. Assigned counsellor name or Pending assignment
5. Complete secure `/admin/leads/[id]` URL

Suggested body: “NEW STUDENT ASSESSMENT. Reference: {{1}}. Country: {{2}}. Degree: {{3}}. Counsellor: {{4}}. View the private assessment: {{5}}.” Do not include DOB, results, student email or student phone. Configure `ASSESSMENT_WHATSAPP_TEMPLATE` and matching `ASSESSMENT_WHATSAPP_LANGUAGE` (default en). The reusable sender uses the repository's existing Graph v21.0; verify support in your Meta app before launch. This is an approved template alert; no personal WhatsApp endpoints or browser automation.

No new callback is required for sending. Existing WhatsApp webhook configuration (`WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`) is unchanged. Outbox `accepted` means API acceptance; delivery/read receipts are not mapped to these jobs. Use provider dashboards to verify delivery. Rate-limit rejections retry automatically. Ambiguous network/Meta failures go to `review_required` to avoid blindly duplicating a WhatsApp alert; staff must verify acceptance in Meta before explicitly retrying. Meta does not provide an idempotency key for this send operation. No system can promise exactly-once delivery across a crash after provider acceptance; this implementation chooses manual reconciliation for that case.

## Reliable processing on Vercel

Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`, install/sync the existing `/api/inngest` endpoint in Inngest for the deployed Vercel environment, and confirm `assessment-notifications` appears. It polls persisted jobs every two minutes for notifications and retries, alongside the immediate email attempt after submission; no submission request must remain open, and no best-effort event publish can lose a notification. Each run claims up to 5 jobs via atomic SKIP LOCKED SQL leases. Inngest singleton limits overlap. Pending/retry jobs back off exponentially, configuration-required jobs recheck hourly; bounded provider attempts fail after five attempts. Expired processing leases go to manual review. Jobs remain visible in admin. High traffic may need a larger batch or schedule after monitoring backlog. Configuration-required polling does not send anything. Inngest must be configured for scheduled retries and WhatsApp processing; the initial email attempt runs after the submission response.

Production must configure both Upstash variables and both Turnstile variables. The reused rate limiter has a process-memory fallback, which is **not distributed protection** on Vercel. Without Upstash and Turnstile this is not ready for public production intake. Register both production and preview domains in Turnstile as appropriate. No client fields are sent to analytics. The single `consultation_assessment_submitted` dataLayer event fires after confirmed save; configure one GTM/GA4 conversion tag for it and avoid generic form-submit tracking on this form. Audit existing GTM tags for automatic collection of form values before launch.

## Privacy, retention and access

Only active Clerk-backed admin/counselor roles can read assessment pages or mutate notes/assignment. Next server actions enforce origin checks. API requires same-origin JSON. Private pages have noindex and are dynamically authenticated. Confirmation is not persisted in session/local storage. Responses are no-store. Logs/errors contain no profile or raw provider response; existing provider helper SDK logging should be kept under restricted log access. Avoid enabling request-body capture or session replay of inputs in external monitoring.

Consent v1 records the exact text identifier and server timestamp; v1 text is in `lib/consultation/schema.ts`. A separate promotional opt-in is not added. Public privacy link remains in the form. Office procedure: handle access/correction/deletion requests at the existing support email, verify the requester privately, and limit access to authorised staff. Before launch the agency must approve a retention schedule and publish it in its privacy policy. Review closed/inactive assessments at least quarterly and remove/anonymise unnecessary profile, contact, consent, outbox and notes according to that approved schedule; respect legal holds. No automatic deletion is enabled without an approved retention period. Existing application/document/message foreign keys must be reviewed before deletion. Database backups/provider logs have separate retention settings.

## Verification and launch checklist

Run `npm run typecheck`, `npm run lint`, `npm run build`. Run actual tests using `npx tsx --test lib/consultation/*.test.ts lib/schemas/lead.test.ts lib/whatsapp/send.test.ts lib/email/send.test.ts lib/eligibility-form.test.ts`; the repository's `npm test` and `test:e2e` are currently placeholders. New tests use mock fetch and fictional data and never contact messaging providers.

Before production, on an isolated Neon branch with sandbox providers:

- Apply migration and configure a real/test staff profile. Complete Bachelor, Master and PhD submissions, including pending HSC, MOI/Not Taken, study gaps, China HSK, multiple tests and unknown intake.
- Submit the same key/payload twice and concurrently: one lead, same reference, two outbox jobs. Different keys concurrently: different references. Changed payload with reused key: 409. Invalid payload: no saved lead/jobs.
- Disable/omit staff counsellor profile: save the agency-designated contact snapshot without a staff-account link. Re-enable: new leads link to the staff profile; old contact snapshots remain unchanged.
- Check anonymous and student accounts cannot read detail/list or invoke staff mutations; check active staff search/reference, destination/date/counsellor filters, pagination, status/notes/reassignment.
- Sync Inngest, run poll with sandbox Resend/Meta, verify acceptance/failure/retry/configuration/ambiguous states and interrupted worker recovery. Confirm one provider alert per job. Check email HTML with markup entered as a name (escaped).
- Check desktop and narrow mobile in a real browser, keyboard focus, error announcements, all Back/Continue/review/edit paths; recheck home, contact, quiz, navigation and Bangla shell. Questionnaire copy currently uses English on both locales apart from translated heading/free note, so complete Bangla translation remains a content follow-up.
- Verify GTM event after persisted save only; confirm no name/contact/DOB/results in analytics. Verify HTTPS public URL and noindex/private cache behaviour.

Live database transaction/concurrency, staff session E2E and real notification delivery require staging configuration and are not claimed from unit tests or a build.

## Verification recorded before the consultation save fix

All 164 Node tests pass (including shared validation, provider mocks, existing auth/lead/quiz regression tests and HTML escaping). ESLint, TypeScript and a production build pass. HTTP smoke checks returned 200 for consultation, contact and eligibility quiz; unauthenticated admin access returned 404 through Clerk (no lead data). Browser visual verification was attempted but the computer/browser host was unavailable. No migration, synthetic lead insert or real alert was sent to the configured database/providers. Staging persistence, concurrent reference/idempotency, admin-session E2E and desktop/mobile visual checks remain launch gates.

## Changed-file inventory

- `.env.example`
- `app/[locale]/consultation/page.tsx`
- `app/[locale]/contact/page.tsx`
- `app/admin/layout.tsx`
- `app/admin/leads/[id]/actions.ts`
- `app/admin/leads/[id]/page.tsx`
- `app/admin/leads/page.tsx`
- `app/api/consultation/route.ts`
- `app/api/inngest/route.ts`
- `app/sitemap.ts`
- `components/consultation/admin-dashboard.tsx`
- `components/consultation/assessment-form.tsx`
- `components/layout/site-header.tsx`
- `components/marketing/about-page.tsx`
- `components/marketing/home-about-section.tsx`
- `components/marketing/home-page.tsx`
- `components/marketing/journey-roadmap.tsx`
- `db/migrations/0020_youthful_human_torch.sql`
- `db/migrations/meta/0020_snapshot.json`
- `db/migrations/meta/_journal.json`
- `db/schema.ts`
- `docs/consultation-system.md`
- `lib/consultation/email-html.ts`
- `lib/consultation/notifications.ts`
- `lib/consultation/providers.test.ts`
- `lib/consultation/schema.test.ts`
- `lib/consultation/schema.ts`
- `lib/email/send.ts`
- `lib/i18n/paths.ts`
- `lib/inngest/functions/assessment-outbox.ts`
- `lib/leads/list-query.ts`
- `lib/leads/list.ts`
- `lib/whatsapp/send.ts`
- `middleware.ts`
- `scripts/setup-assessment-counselor.ts`

Additional HTTP checks passed: cross-origin POST 403, malformed JSON 400, missing fields 400, body over 24KB 413. None of these checks inserted records or sent notifications.

## Consultation save and confirmation fix (2026-11-05)

The configured database was missing migration `0020_youthful_human_torch`, causing valid submissions to return 503. Applied the pending migration and verified the assessment columns, sequence, tables and trigger. A real HTTP integration check saved a synthetic assessment, verified its persisted answers and counsellor snapshot, retried it concurrently without duplicate leads/jobs, rejected an altered payload using the same key, and confirmed the immediate email attempt recorded missing configuration. The same scoped email job was then processed using a mocked Resend response: the complete assessment targeted `support@studyabroadconsultantbd.com`, provider acceptance was persisted and repeated processing did not resend. Removed the synthetic assessment and its outbox jobs afterward.

The initial consultation HTML returns 200 without the counsellor name or contact card. Component render tests cover the English/Bangla assigned confirmation and call/WhatsApp links. Browser visual testing was unavailable because the browser access host was unavailable.

Real delivery is still blocked in this workspace: `RESEND_API_KEY` and a verified `EMAIL_FROM` are missing. Inngest credentials are also missing, so scheduled retries need activation. No real email was sent or claimed delivered.

## Development server recovery (2026-11-05)

A production build overwrote the running development server's shared `.next` files, causing the page and API to return plain-text 500 responses. The form could not parse that response as JSON and showed “We could not confirm your submission.” `next.config.ts` now uses `.next-dev` for the development phase and `.next` for production. The config change restarted the development server. A fresh real-HTTP integration test then saved answers and returned the assigned counsellor successfully; concurrent retries and the mocked email worker also passed. Test fixtures were removed afterward.
