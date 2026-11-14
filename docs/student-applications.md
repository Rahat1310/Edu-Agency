# Leads, applications and student tracking

All public enquiry sources continue to write to `leads`. `/admin/leads` now shows all leads by default. Source and processing-stage filters persist in pagination and drawer links. Existing `/admin/leads?view=legacy` links still open the unified list. Assessment follow-ups remain available at `/admin/leads?view=assessments`; they are a filtered workflow over the same records. The submitted-application filter checks the linked application's submission date and retains the original lead source.

The pipeline and student processing tracker both read `leads.status`. Student form submission never advances that stage automatically. Staff stage changes and their student-visible audit entry are committed in one SQL statement. The portal dashboard refreshes every minute while visible. Private contact notes stay outside the student feed.

## Student flow

1. Sign up or sign in, then complete phone onboarding. A new student without an enquiry gets a lead and linked application. Linking an existing enquiry requires a matching verified Clerk email or phone. Ambiguous or unverified matches go to the existing staff unlinked-accounts queue; entering a phone number alone does not grant access to another student's records.
2. `/portal/application` provides personal, academic, study-preference and document/review sections. University preference is free text. Existing profile-matching data remains unchanged in `applications.profile`; the form uses separate typed `application_data`.
3. Drafts can be incomplete. Save explicitly before leaving the form, especially before opening Documents. “Save draft & upload documents” saves first and navigates only on success. A browser close/reload prompts when there are unsaved changes.
4. The full checklist is available before the application is filled in: passport, academic certificates and transcripts (including eight diploma semesters), English/HSK evidence, medical, non-criminal certificate, bank statement, photo, recommendation letter, study plan, work and award certificates, parental ID, salary certificate and resume/CV. Required labels reflect the standard list, saved qualifications and staff requests; other categories are marked “If needed.” These labels guide collection and do not block submission. Multiple files per category remain supported. A green tick indicates a pending or approved upload; a red cross indicates a missing file or a rejected file needing replacement. Uploads update the checklist and counter immediately after the server saves them. Existing generic categories remain available and files are never silently relabelled.
5. Submission requires complete validated form information and consent. Students can submit with no documents or a partial set, including when staff-requested documents are missing, and upload more later. Form, ownership, revision and processing-stage checks remain enforced on the server and in SQL. R2 must be configured for uploads, but missing uploads do not prevent form submission.
6. Submitting locks the form. Staff can reopen it with correction instructions. The student can continue uploading requested documents. Each submission retains an immutable copy of the form and the accepted/pending document IDs. Original submission time and enquiry history are retained across corrections.

Application completion (`draft`, `submitted`, `changes_requested`) is separate from processing (`new`, `contacted`, `documents`, `applied`, `offer`, `visa`, `departed`). Destination changes once university processing has started need staff intervention; the server blocks a student's conflicting country change. Application reference is `APP-` followed by the application's unique ID.

## Staff flow

`/admin/applications` lists linked student files, with name/university/contact search, completion filters and pagination. Drafts are labelled explicitly. The lead drawer and lead detail page link to that lead's application. `/admin/applications/[id]` provides form details, submission history, university review, document review, processing-stage controls and contact/activity history.

Staff can mark a preferred university available or unavailable, suggest an alternative and record an agreed university. The original submitted preference is retained. Unavailable choices require an explanation. Alternatives require a university name. Recording an agreed choice requires a staff contact/agreement note. University updates and correction instructions are visible to students; contact records are staff-only. Additional required documents appear automatically in the student's checklist. Stage changes use the existing pipeline action rather than a second status field.

Saves use revision checks. A stale browser cannot overwrite a newer student/staff edit. Review changes and public/private audit entries commit together. No external university submission, email, WhatsApp message or payment is sent by these new actions. Staff continue communicating through their existing channels and record that contact.

## Database and configuration

Migrations `0021_student_application_forms.sql` and `0022_application_submission_history.sql` are additive and were applied to the configured database. Apply them with `npm run db:migrate` to other deployment databases before deploying the code. Existing application IDs, student links, documents and matching profiles are preserved. Submission history has row-level security enabled and is accessed by the trusted server database role; do not add anonymous policies. History is removed with its parent application when an authorised admin deletes the lead through the existing deletion flow.

R2 settings are still required in the runtime environment: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and optionally `R2_ENDPOINT`. Keep the student bucket private and configure browser CORS as described in `env-guide.md`. The upload cap remains 10 MB per PDF/JPG/PNG. Upload rate allowance accommodates the extended checklist; uploads retain size/type checks, unique per-application keys and short-lived access URLs.

## Validation

Run `npx tsx --env-file=.env.local --test lib/applications/application.test.ts lib/applications/flow.integration.test.ts lib/documents/upload-gate.test.ts lib/schemas/document-type.test.ts lib/documents/review.test.ts` plus `npm run typecheck`, `npm run lint`, and `npm run build`.

The integration test creates synthetic student/lead/application/document rows, exercises the actual save/review SQL and removes all fixtures in the same database transaction. It sends no notifications and writes no R2 objects. It checks submission without documents, resubmission with partial uploads and missing staff-requested files, ownership, stale edits, locked forms, staff privacy, immutable history, retained source and processing-stage restrictions.

An authenticated browser walkthrough and a real R2 upload still need verification in a connected browser with R2 configured. This session's browser host was unavailable, and R2 credentials were absent. These limitations do not prevent checking the database workflow with synthetic fixtures or testing unauthenticated route protection.
