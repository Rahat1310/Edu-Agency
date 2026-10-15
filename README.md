# Study Abroad Consultant

A study abroad platform for Bangladeshi students applying to universities in **China, India, Malaysia, and South Korea**. It combines a bilingual public website, a student application portal, and a counselor desk for managing admissions, documents, and visa progress.

**Website:** [studyabroadconsultantbd.com](https://www.studyabroadconsultantbd.com)

Built with Next.js App Router, React, TypeScript, PostgreSQL, and Clerk. Features described below reflect the repository; services such as storage, AI, and messaging need their own configuration.

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Local setup](#local-setup)
- [Environment configuration](#environment-configuration)
- [Accounts and access](#accounts-and-access)
- [Routes and API](#routes-and-api)
- [Languages and content](#languages-and-content)
- [Database and storage](#database-and-storage)
- [AI and automation](#ai-and-automation)
- [Link previews and SEO](#link-previews-and-seo)
- [Scripts and checks](#scripts-and-checks)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Development workflow](#development-workflow)
- [Further documentation](#further-documentation)

## Features

### Public website

- English and Bengali pages with a language switcher and localized URLs.
- Responsive homepage with an interactive 3D globe, study destinations, university highlights, an application roadmap, and consultation calls to action.
- Destination guides for China, India, Malaysia, and South Korea, including pre-departure information.
- Published program directory with country, degree-level, and subject filters, pagination, tuition details, entry requirements, and scholarship information.
- Shareable comparison of up to **three programs**.
- Eligibility assessment using education, language-test scores, destination, and budget; results and contact details are saved as a lead.
- Consultation and contact forms, WhatsApp click-to-chat links, and an AI FAQ widget with counselor handoff.
- Published student success stories with destination filters and optional public photos.
- About, contact, and privacy pages.
- Per-page metadata, canonical and language-alternate URLs, sitemap, robots rules, and social sharing cards.

**Cost calculator:** tuition/living-cost estimation and BDT conversion are implemented, but the public calculator currently displays **Coming soon**. Its switch is `COST_CALCULATOR_ENABLED` in [lib/costs/config.ts](lib/costs/config.ts).

### Student portal

- Clerk sign-in and sign-up, with student accounts linked to an application file.
- Onboarding for accounts that do not yet have a linked application.
- Application stage, student-visible activity, and visa progress.
- Profile-based program recommendations and profile updates.
- Private document uploads with progress, review status, and counselor feedback.
- Destination-specific visa document checklists.
- PDF, JPEG, and PNG uploads up to **10 MiB per file**.

### Counselor and admin desk

- Searchable/filterable lead lists, lead details, and counselor assignment.
- Drag-and-drop pipeline: **New → Contacted → Documents → Applied → Offer → Visa → Departed**.
- Activity history and notes, including notes that can be shown to students.
- Document approval/rejection with review feedback.
- Visa application tracking and destination-specific document requirement management.
- Program, intake-deadline, and success-story publishing tools.
- Queues for unlinked student accounts and unmatched messages.
- Stored WhatsApp/Messenger message threads and reminder/nurture history.
- Counselor performance reports and AI usage reporting.
- Role checks for students, counselors, and admins; selected destructive actions require admin access.

### Integration scope

The repository includes WhatsApp outbound sending and a desk interface for stored WhatsApp/Messenger messages. It currently exposes a **Clerk webhook**, but no WhatsApp or Messenger inbound webhook route. Setting the `FACEBOOK_*` environment variables alone does not enable automatic message ingestion.

## Technology stack

| Area                    | Implementation                                                   |
| ----------------------- | ---------------------------------------------------------------- |
| Application             | Next.js 15 App Router, React 19, TypeScript 5                    |
| UI                      | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide icons                |
| Animation and graphics  | Framer Motion, Three.js, globe.gl, cobe                          |
| Forms and validation    | React Hook Form, Zod                                             |
| Database                | Neon PostgreSQL through Drizzle ORM and the Neon HTTP driver     |
| Authentication          | Clerk; application roles stored in PostgreSQL                    |
| Documents               | Cloudflare R2 through the AWS S3 SDK and signed URLs             |
| Cache and rate limiting | Upstash Redis with process-local fallbacks                       |
| AI                      | Groq, Gemini, and OpenRouter through a shared gateway            |
| Background jobs         | Inngest                                                          |
| Outbound communication  | Resend email, WhatsApp Cloud API, configurable SMS HTTP endpoint |
| Analytics               | Vercel Analytics, Speed Insights, and Google Tag Manager         |
| Code quality            | ESLint, Prettier, Husky, lint-staged                             |

## Local setup

Local validation uses **Node.js 24.x** and npm. You also need a Neon PostgreSQL database and a Clerk application.

### 1. Get the code and install dependencies

```bash
git clone https://github.com/Rahat1310/Edu-Agency.git
cd Edu-Agency
npm ci
```

### 2. Create the local environment file

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Fill in these four required values before starting the app:

| Variable                            | Purpose                                   |
| ----------------------------------- | ----------------------------------------- |
| `DATABASE_URL`                      | Neon/PostgreSQL runtime connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk browser authentication              |
| `CLERK_SECRET_KEY`                  | Clerk server authentication               |
| `CLERK_WEBHOOK_SECRET`              | Verification of Clerk webhook events      |

Keep `NEXT_PUBLIC_APP_URL=http://localhost:3000` for local development. Never commit `.env.local`; it contains credentials.

### 3. Apply database migrations

```bash
npm run db:migrate
```

Migrations use `DATABASE_URL_UNPOOLED` when provided, otherwise `DATABASE_URL`. Public program pages need database access, including during production builds.

### 4. Start the website

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). Create an account to use the portal; follow [Accounts and access](#accounts-and-access) to enable staff access.

### 5. Add content

Use the counselor/admin publishing tools for programs, intake deadlines, visa requirements, and success stories.

An optional program catalog seed is available:

```bash
npm run db:seed:programs
```

**The seed script replaces existing program rows by default when the table is populated.** Use it on a development database or after reviewing the script and backing up any catalog you need to retain.

## Environment configuration

See [.env.example](.env.example) for the template and [docs/env-guide.md](docs/env-guide.md) for service setup details. Current runtime behavior is summarized here.

| Capability                  | Configuration                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Public URLs                 | `NEXT_PUBLIC_APP_URL`; production should use `https://www.studyabroadconsultantbd.com`                                      |
| WhatsApp consultation links | `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER`, international digits without `+`; falls back to the agency number in `lib/whatsapp.ts` |
| Admin email allowlist       | Optional `ADMIN_EMAILS`, comma-separated; matching signed-in users are promoted by the session loader                       |
| Private document storage    | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`; optional `R2_ENDPOINT` override              |
| Public success-story photos | `R2_PUBLIC_BASE_URL`, pointing to a public marketing-assets bucket or custom domain                                         |
| Shared cache/rate limits    | `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`                                                                     |
| Form spam verification      | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`                                                                 |
| AI chat/recommendations     | At least one of `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`                                                      |
| Email                       | `RESEND_API_KEY` and `EMAIL_FROM`                                                                                           |
| WhatsApp outbound jobs      | `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`                                                                      |
| SMS                         | `SMS_API_URL`, `SMS_API_KEY`, optional `SMS_SENDER_ID`                                                                      |
| Scheduled jobs              | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`                                                                                  |
| Reminder windows            | Optional `INTAKE_REMINDER_WINDOWS`, default `14,7,2`                                                                        |

Important configuration behavior:

- Lead and eligibility submissions skip Turnstile if **both** Turnstile variables are empty. Configure both to enable verification; an incomplete setup can reject submissions.
- Without Upstash, rate limiting and relevant caches fall back to process memory. That fallback is per process, so it does not provide a shared limit across serverless instances.
- Missing messaging credentials cause email, WhatsApp, or SMS send helpers to run in dry-run mode. Automation can still record the run as sent.
- Storage, AI, and delivery features require their own valid credentials even though the public site can start without those optional services.
- The template also lists future/reserved integrations. Sentry, PostHog, Trigger.dev, Anthropic, and OpenAI environment entries do not by themselves enable implementations in this repository. The active AI gateway uses Groq/Gemini/OpenRouter and scheduled jobs use Inngest.

## Accounts and access

Roles are stored in `users.role`: `student`, `counselor`, or `admin`. New accounts default to student. Clerk webhooks synchronize account information; the session loader can also provision a missing database user.

To promote an existing signed-in account:

```bash
npm run make-admin -- person@example.com
```

The account must already exist in the database. For counselor access, use `npm run db:studio`, locate the user, and set `role` to `counselor`. Staff enter at `/admin`; students use `/portal`.

An optional `ADMIN_EMAILS` allowlist is also supported by [lib/auth-helpers.ts](lib/auth-helpers.ts). See [internal notes](docs/internal-notes.md) for role and public-photo guidance.

## Routes and API

English marketing URLs have no locale prefix; Bengali equivalents use `/bn`.

| Route                                                | Purpose                                             |
| ---------------------------------------------------- | --------------------------------------------------- |
| `/`, `/about`, `/contact`, `/privacy`                | Public website and agency information               |
| `/destinations`, `/destinations/[slug]`              | Country guides                                      |
| `/destinations/[slug]/pre-departure`                 | Country-specific pre-departure guide                |
| `/programs`, `/programs/[id]`                        | Published program directory and details             |
| `/programs/compare?ids=...`                          | Compare up to three programs                        |
| `/eligibility-quiz`                                  | Eligibility assessment and lead capture             |
| `/cost-calculator`                                   | Coming-soon page while its feature flag is disabled |
| `/success-stories`                                   | Published student stories                           |
| `/sign-in`, `/sign-up`                               | Authentication                                      |
| `/portal`, `/portal/onboarding`                      | Student dashboard and account linking               |
| `/portal/documents`, `/portal/matches`               | Student documents and program recommendations       |
| `/dashboard`                                         | Role-aware account entry page                       |
| `/admin/leads`, `/admin/pipeline`                    | Counselor lead management                           |
| `/admin/programs`, `/admin/intake-deadlines`         | Program and intake publishing                       |
| `/admin/success-stories`, `/admin/visa-requirements` | Story and visa-checklist publishing                 |
| `/admin/unlinked`, `/admin/unmatched-messages`       | Account/message reconciliation                      |
| `/admin/performance`, `/admin/ai-usage`              | Staff and AI reports                                |

The `/admin` entry redirects to `/admin/leads`.

| API endpoint                       | Methods        | Purpose                                  |
| ---------------------------------- | -------------- | ---------------------------------------- |
| `/api/leads`                       | POST           | Consultation/contact lead capture        |
| `/api/eligibility-quiz`            | POST           | Assessment and lead creation             |
| `/api/chat`                        | POST           | Public FAQ assistant                     |
| `/api/webhooks/clerk`              | POST           | Signed Clerk account events              |
| `/api/inngest`                     | GET, POST, PUT | Inngest job registration and execution   |
| `/api/portal/documents/upload-url` | POST           | Authorized signed upload URL             |
| `/api/portal/documents/complete`   | POST           | Validate and record an uploaded document |
| `/api/portal/documents/[id]/view`  | GET            | Authorized student document viewing      |
| `/api/admin/documents/[id]/view`   | GET            | Authorized staff document viewing        |

Most staff mutations use Next.js server actions alongside these API routes.

## Languages and content

Marketing routes are generated under `app/[locale]`:

| Language         | Public URL example       |
| ---------------- | ------------------------ |
| English, default | `/destinations/china`    |
| Bengali          | `/bn/destinations/china` |

Middleware rewrites unprefixed marketing paths to `/en/...` internally. Direct `/en/...` visits redirect to the unprefixed canonical path. The language switcher links to the corresponding page in the other locale.

Shared dictionaries live in [lib/i18n/en.ts](lib/i18n/en.ts) and [lib/i18n/bn.ts](lib/i18n/bn.ts). Some components also contain locale-specific copy. Marketing routes use static generation/ISR and cached server queries where configured; interactive forms and chat submit to the server.

Program and story publication is controlled from the desk. Destination copy and eligibility rules are maintained in source.

## Database and storage

The Drizzle schema is in [db/schema.ts](db/schema.ts), with checked-in migrations under [db/migrations](db/migrations). It covers users, programs, leads, activity, applications, account linking, documents, visa requirements/applications, costs, intake deadlines, success stories, AI usage, messages, reminders, and nurture sends.

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

Generate migrations after schema changes, review the generated SQL, then apply it to the intended database. `db:studio` opens the database management interface.

Student documents use a **private** R2 bucket. Upload URLs expire after five minutes and view URLs after one minute. The upload-completion route verifies uploaded objects; access is checked against the linked application or staff role.

Configure the private bucket's CORS rules to allow uploads from your local and production website origins with the headers required by the upload request. Public success-story photos use a separate public asset origin; private student files must not be used as marketing photos.

## AI and automation

### FAQ assistant and program matching

The shared gateway supports provider fallback, timeouts, usage logging, and cached results.

| Task             | Provider order in the current configuration |
| ---------------- | ------------------------------------------- |
| Public FAQ chat  | Groq → Gemini → OpenRouter                  |
| Program matching | Gemini → Groq → OpenRouter                  |

Models and provider order are configured in [lib/ai/config.ts](lib/ai/config.ts). Matching filters published programs before ranking them against a student's profile. The FAQ assistant can offer a counselor handoff; AI recommendations are guidance, not admission decisions.

The eligibility quiz uses local rules in [lib/eligibility.ts](lib/eligibility.ts), independently of the AI gateway.

### Scheduled jobs

| Job              | Schedule, Asia/Dhaka | Event                  | Behavior                                   |
| ---------------- | -------------------- | ---------------------- | ------------------------------------------ |
| Intake reminders | Daily 09:00          | `reminders/intake.run` | Deadline-based email and near-deadline SMS |
| Lead nurture     | Daily 10:00          | `nurture/leads.run`    | Follow-ups for idle new/contacted leads    |

Jobs run in batches through [app/api/inngest/route.ts](app/api/inngest/route.ts), with stored send records used to skip repeats. They do not continuously poll the database between scheduled runs.

Reminder windows default to 14, 7, and 2 days before the nearest applicable intake deadline. SMS is added within the two-day threshold. Nurture steps default to 5, 10, and 20 idle days and are editable in [lib/nurture/sequence.ts](lib/nurture/sequence.ts). Status changes and inbound replies are checked before sending.

WhatsApp nurture uses free-form messages within the configured customer-care window and templates outside it. Set up the templates named `nurture_idle_5`, `nurture_idle_10`, and `nurture_idle_20`, with body variables for student name and destination. Email is used when no phone is available or as a fallback after a WhatsApp error when an email address exists.

For local Inngest development, start the website and then run:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

One-off npm entry points are `npm run reminders:run` and `npm run nurture:run`. Their job modules import `server-only`; direct Node CLI execution needs the `react-server` export condition. These equivalent commands provide it:

```bash
node --conditions=react-server --import tsx scripts/run-intake-reminders.ts
node --conditions=react-server --import tsx scripts/run-lead-nurture.ts
```

These commands use `.env.local` and operate on its configured database. With delivery credentials configured, they can send real messages. Without those credentials, dry-run deliveries are still recorded and affect later deduplication.

## Link previews and SEO

WhatsApp, Messenger, and other sharing clients receive a branded **1200 × 630 JPEG** card, plus page-specific titles and descriptions. English and Bengali routes provide localized metadata.

- Shared image definition: [lib/seo/social-preview.ts](lib/seo/social-preview.ts)
- Per-page metadata: [lib/seo/page-metadata.ts](lib/seo/page-metadata.ts)
- Preview image: [public/images/study-abroad-preview-v1.jpg](public/images/study-abroad-preview-v1.jpg)
- URL configuration: [lib/site-url.ts](lib/site-url.ts)

Rebuild the card from the website's logo and homepage illustrations:

```bash
node scripts/generate-social-preview.mjs
```

Set the production URL before building and deploy the generated image with the site. Sharing apps may cache previous cards. See [docs/social-previews.md](docs/social-previews.md) for verification and cache-refresh instructions.

The app also generates `/sitemap.xml`, `/robots.txt`, language alternates, and structured data for published success stories.

## Scripts and checks

| Command                                    | Purpose                                         |
| ------------------------------------------ | ----------------------------------------------- |
| `npm ci`                                   | Install exact dependencies from the lockfile    |
| `npm run dev`                              | Start Next.js development with Turbopack        |
| `npm run build`                            | Build the production application                |
| `npm run start`                            | Serve an existing production build              |
| `npm run lint`                             | Run ESLint; warnings fail the command           |
| `npm run typecheck`                        | Run TypeScript without emitting files           |
| `npm run db:generate`                      | Generate Drizzle migrations                     |
| `npm run db:migrate`                       | Apply database migrations                       |
| `npm run db:studio`                        | Open Drizzle Studio                             |
| `npm run db:seed:programs`                 | Seed/replace the program catalog                |
| `npm run make-admin -- email@example.com`  | Promote an existing database user               |
| `npm run reminders:run`                    | One-off reminder batch; see CLI condition above |
| `npm run nurture:run`                      | One-off nurture batch; see CLI condition above  |
| `node scripts/generate-social-preview.mjs` | Regenerate the social card                      |
| `npm test`, `npm run test:e2e`             | Placeholder commands; neither runs a suite yet  |

Focused tests already exist as `lib/**/*.test.ts` and use Node's test runner. For example:

```bash
npx tsx --test lib/eligibility-form.test.ts lib/schemas/lead.test.ts lib/schemas/eligibility.test.ts
```

Other test files cover program comparison/matching, AI fallback, documents, visa checklists, messages, reminders, nurture, costs, and success stories. A unified test script and browser E2E runner are not configured.

For application changes, run:

```bash
npm run lint
npm run typecheck
npm run build
```

Builds require the mandatory environment variables, access to the configured database for prerendered content, and network access to fetch Google fonts when they are not cached.

## Deployment

The project is structured for Next.js hosting on Vercel with Neon PostgreSQL.

1. Connect the repository and install dependencies from the lockfile.
2. Configure the four required environment variables and any services you intend to enable.
3. Set `NEXT_PUBLIC_APP_URL=https://www.studyabroadconsultantbd.com` in production. Use the intended origin for any separate environment.
4. Apply reviewed migrations to the target database before building code that depends on them.
5. Build with `npm run build`. For a self-hosted Node deployment, serve it with `npm run start`.
6. Configure Clerk origins and the public `/api/webhooks/clerk` endpoint for `user.created`, `user.updated`, and `user.deleted`; use that endpoint's signing secret.
7. Configure R2 upload CORS, public marketing-photo delivery, Upstash, Turnstile, AI, and message providers as needed.
8. Register the deployed `/api/inngest` endpoint with Inngest so scheduled jobs can run.
9. Verify public forms, role access, portal linking, document uploads, and sharing metadata in the deployed environment.

Security headers are configured in [lib/security-headers.ts](lib/security-headers.ts) and applied by middleware/Next.js. The implementation also includes signed webhook verification, server-side role checks, input validation, honeypot fields, optional Turnstile verification, rate limits, and short-lived document grants.

External scripts, images, maps, and storage origins must match the Content Security Policy. Review those sources when enabling integrations or changing asset hosts.

## Project structure

```text
app/
  [locale]/          Public English/Bengali pages
  admin/             Counselor/admin pages and server actions
  portal/            Student onboarding, dashboard, documents, matches
  api/               Public forms, chat, Clerk, Inngest, document routes
components/
  marketing/         Public pages, globe, illustrations, program tools
  desk/              Lead lists, pipeline, file detail panels
  portal/            Student portal components
  admin/             Publishing forms and reporting components
  layout/            Shared site layout and navigation
db/
  schema.ts          Drizzle table definitions
  migrations/        Database migrations
lib/                 Domain logic, integrations, validation, tests, i18n, SEO
public/              Logos, icons, public images, social card
scripts/             Catalog seed, role promotion, jobs, image generation
docs/                Configuration and operational documentation
middleware.ts        Locale routing, protected routes, security headers
project-details.md   Product specification and longer-term scope
```

## Development workflow

Before switching computers or beginning work, save existing local edits and update from GitHub:

```bash
git status
git pull --ff-only
```

Review and commit your intended changes, then push them before moving to another PC. If a checkout has uncommitted work, preserve it before pulling and reapply it deliberately to the latest code. Keep local environment files and credentials out of commits.

Husky and lint-staged format/check supported staged files during the commit workflow. Keep dependency changes paired with `package-lock.json`, and include reviewed migrations with schema changes.

## Further documentation

| Document                                   | Purpose                                                      |
| ------------------------------------------ | ------------------------------------------------------------ |
| [.env.example](.env.example)               | Environment variable template                                |
| [Environment guide](docs/env-guide.md)     | Service credentials and setup references                     |
| [Internal notes](docs/internal-notes.md)   | Staff roles and public testimonial-photo handling            |
| [Social previews](docs/social-previews.md) | Card generation, metadata, deployment, cache checks          |
| [Project details](project-details.md)      | Product specification, architecture goals, and planned scope |

The product specification includes future work. Use the current routes, feature flags, and implementation to determine what is available.
