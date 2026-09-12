# Edu Agency

Study abroad consultancy platform for Bangladeshi students applying to universities in China, India, Malaysia, and South Korea.

## Local setup

1. Install [Node.js](https://nodejs.org/) 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment template and create a local secrets file:

   ```bash
   cp .env.example .env.local
   ```

   Leave unused variables blank for now. Fill them in as each service is wired up. Never commit `.env.local`. See [`docs/env-guide.md`](docs/env-guide.md) for what every variable is for and exactly where to get each value.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Language (Bengali / English)

Marketing copy uses **locale routing**, not a client-side dictionary swap. Pages stay SSG. No client-side data fetching.

| Locale            | URL pattern  | Example                                      |
| ----------------- | ------------ | -------------------------------------------- |
| English (default) | Unprefixed   | `/`, `/about`, `/destinations/china`         |
| Bengali           | `/bn` prefix | `/bn`, `/bn/about`, `/bn/destinations/china` |

The header toggle is a pair of links to the same path in the other locale. Middleware rewrites unprefixed marketing URLs to `/en/...` internally so both languages are generated from `app/[locale]`. Visiting `/en/...` redirects to the unprefixed canonical URL.

Dictionaries live in `lib/i18n/en.ts` and `lib/i18n/bn.ts`. Bengali destination body copy is marked as placeholder until the research pass.

## Scripts

| Script                  | What it does                                                             |
| ----------------------- | ------------------------------------------------------------------------ |
| `npm run dev`           | Next.js dev server (Turbopack)                                           |
| `npm run build`         | Production build                                                         |
| `npm run start`         | Serve the production build                                               |
| `npm run lint`          | ESLint; warnings fail the run                                            |
| `npm run typecheck`     | `tsc --noEmit`                                                           |
| `npm test`              | Unit tests (stub until 1.5)                                              |
| `npm run test:e2e`      | E2E tests (stub until 1.5)                                               |
| `npm run reminders:run` | Run the intake-deadline reminder batch once (same work as the daily job) |
| `npm run nurture:run`   | Run the lead nurture batch once (same work as the daily job)             |

## Intake deadline reminders

Reminders are a **scheduled batch**, not a per-student poll (see `project-details.md` Section 7). Inngest calls `/api/inngest` on a cron (`09:00` Asia/Dhaka) and on the event `reminders/intake.run`. Between runs the app does not query Neon for deadlines.

1. Apply migrations so `reminders_sent` exists: `npm run db:migrate`.
2. Optional: set `RESEND_API_KEY` + `EMAIL_FROM`, and `SMS_API_URL` + `SMS_API_KEY` + `SMS_SENDER_ID`. Unset keys dry-run (log only) and still record `reminders_sent`.
3. Optional: `INTAKE_REMINDER_WINDOWS=14,7,2` (calendar days in Dhaka; exact-day match on the nearest upcoming intake for the student's destination). SMS is added when that window is within 48 hours (2 days).
4. Run once against the database: `npm run reminders:run`. A second run sends nothing already logged in `reminders_sent`.
5. Local schedule / dashboard invoke: start `npm run dev`, then in another terminal `npx inngest-cli@latest dev -u http://localhost:3000/api/inngest`.

## Lead nurture

Nurture is a **second scheduled batch** (Section 5.6 / 7): idle `new` and `contacted` leads, not a per-lead poll. Inngest runs it at `10:00` Asia/Dhaka and on the event `nurture/leads.run`.

1. Apply migrations so `messages` and `nurture_sends` exist: `npm run db:migrate`.
2. Edit the sequence in `lib/nurture/sequence.ts` (ordered `afterDays` buckets). Do not change `matchNurtureStep` to retune copy or timing.
3. Optional: `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` (template send outside Meta's 24-hour window). Missing keys dry-run. Email is used when the lead has no WhatsApp/phone (`RESEND_API_KEY` + `EMAIL_FROM`).
4. Approve the WhatsApp templates named in the sequence (`nurture_idle_5`, `nurture_idle_10`, `nurture_idle_20`) with body vars `{{1}}` name and `{{2}}` destination.
5. Run once: `npm run nurture:run`. A lead that replies (inbound `messages` row) or moves past `contacted` is skipped. Every send writes `lead_activity` type `system`.
