# Environment variable guide

Every variable the app can read, grouped the same way as `.env.example`, with what it's for, whether it's required today, and exactly how to get a real value. Copy `.env.example` to `.env.local` and fill in at least the **Required now** group — the app won't boot without those four (see `lib/env.ts` / `instrumentation.ts`).

Never commit `.env.local`. `.gitignore` already excludes `.env*` except `.env.example`.

## Required now (app won't start without these)

These four are validated at boot by `lib/env.ts`. Missing or empty values throw immediately in `instrumentation.ts`, before any page renders.

| Variable                            | What it's for                                                                                          | How to get it                                                                                                                                                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                      | Postgres connection Drizzle uses at runtime (Neon HTTP driver, `db/index.ts`)                          | Create a free project at [neon.tech](https://neon.tech) → open the project → **Connection Details** → copy the **pooled** connection string (has `-pooler` in the host). Use the `postgresql://...` string as-is.                                                                       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk browser SDK key (safe to expose)                                                                 | Create a free app at [clerk.com](https://dashboard.clerk.com) → **API Keys** page → copy **Publishable key** (starts `pk_test_` / `pk_live_`).                                                                                                                                          |
| `CLERK_SECRET_KEY`                  | Server-side Clerk session verification + Backend API                                                   | Same Clerk **API Keys** page → copy **Secret key** (starts `sk_test_` / `sk_live_`). Keep server-only, never expose to the client.                                                                                                                                                      |
| `CLERK_WEBHOOK_SECRET`              | Verifies signatures on Clerk's user webhook (`app/api/webhooks/clerk/route.ts`, keeps `users` in sync) | Clerk Dashboard → **Webhooks** → **Add Endpoint** → URL `https://<your-domain>/api/webhooks/clerk` (or an [ngrok](https://ngrok.com)/Clerk CLI tunnel URL for local dev) → subscribe to `user.created`, `user.updated`, `user.deleted` → copy the **Signing Secret** (starts `whsec_`). |

## App

| Variable                            | What it's for                                                                                | How to get it                                                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`               | Canonical origin for Clerk redirects, webhooks, sitemap/OG absolute URLs (`lib/site-url.ts`) | No signup needed. Use `http://localhost:3000` locally; set to your real domain (e.g. `https://eduagency.com`) in production. |
| `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` | Click-to-chat WhatsApp number (`lib/whatsapp.ts`)                                            | Your own WhatsApp Business number, international format, digits only, no leading `+` (e.g. `8801XXXXXXXXX`).                 |

## Database — Neon Postgres

| Variable                | What it's for                                                                                                 | How to get it                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Required — see above.                                                                                         |
| `DATABASE_URL_UNPOOLED` | Direct (non-pooled) connection used by `drizzle-kit` for migrations/studio (`drizzle.config.ts` prefers this) | Same Neon **Connection Details** panel → toggle off "Pooled connection" (or copy the connection string without `-pooler` in the host). |

## Auth — Clerk

| Variable                                                                          | What it's for                                                                                                                                   | How to get it                                                                                                                                                                     |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` / `CLERK_WEBHOOK_SECRET` | Required — see above.                                                                                                                           |
| `NEXT_PUBLIC_CLERK_FRONTEND_API`                                                  | Locks down CSP to your exact Clerk Frontend API host (`lib/security-headers.ts`) instead of the wildcard `*.clerk.accounts.dev` / `*.clerk.com` | Clerk Dashboard → **Domains** (or **API Keys** → "Frontend API") → copy the host, e.g. `your-app-name-13.clerk.accounts.dev`. Optional — leave blank to use the wildcard pattern. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                 | Paths middleware redirects to for sign-in/up                                                                                                    | No signup needed — these already default to `/sign-in` / `/sign-up`, matching `app/sign-in` and `app/sign-up`. Only change if you move those routes.                              |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`     | Where students/staff land after auth                                                                                                            | No signup needed — default to `/portal`. Only change if you want a different landing route.                                                                                       |

## File storage — Cloudflare R2

Used for private student documents (signed URLs, `lib/r2.ts`) and optionally public success-story photos.

| Variable                                    | What it's for                                                                                   | How to get it                                                                                                                                                                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `R2_ACCOUNT_ID`                             | Identifies your Cloudflare account                                                              | Cloudflare Dashboard → right sidebar shows **Account ID** (also visible on the R2 overview page).                                                                                                                                              |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | S3-compatible credentials for server-side uploads and presigned URLs                            | Cloudflare Dashboard → **R2** → **Manage R2 API Tokens** → **Create API token** (Object Read & Write) → copy the Access Key ID and Secret Access Key shown once at creation.                                                                   |
| `R2_BUCKET_NAME`                            | Name of the **private** documents bucket                                                        | Cloudflare Dashboard → **R2** → **Create bucket** (e.g. `edu-agency-documents`) → use that name.                                                                                                                                               |
| `R2_ENDPOINT`                               | S3-compatible endpoint for the account                                                          | `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com` — build it from your account ID above.                                                                                                                                                      |
| `R2_PUBLIC_BASE_URL`                        | Public origin for founder-approved marketing photos only — **not** the private documents bucket | Create a **separate public** bucket (e.g. `edu-agency-public`) → enable the free `r2.dev` subdomain (bucket **Settings** → **Public access**) or attach a custom domain → use that URL. Leave blank to publish success stories without photos. |

## Caching — Upstash Redis

Used for form/API rate limiting (`lib/rate-limit.ts`) and read-through caches (`lib/ai/faq-cache.ts`, `lib/fx/rates.ts`).

| Variable                   | What it's for                        | How to get it                                                                                                                                              |
| -------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | REST endpoint for the Redis database | Create a free database at [upstash.com](https://console.upstash.com) → **Redis** → **Create Database** → **REST API** tab → copy `UPSTASH_REDIS_REST_URL`. |
| `UPSTASH_REDIS_REST_TOKEN` | Auth token for REST calls            | Same **REST API** tab → copy `UPSTASH_REDIS_REST_TOKEN`.                                                                                                   |

Leaving both blank does not crash the app — rate limiting and caching are skipped (fail-open), but you lose spam protection on public forms.

## Spam protection — Cloudflare Turnstile

Used on lead/contact/eligibility forms (`lib/turnstile.ts`, `components/turnstile-field.tsx`).

| Variable                         | What it's for                          | How to get it                                                                                                                    |
| -------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Renders the CAPTCHA widget client-side | Cloudflare Dashboard → **Turnstile** → **Add site** → enter your domain (use `localhost` for local dev) → copy the **Site Key**. |
| `TURNSTILE_SECRET_KEY`           | Server verifies the widget's token     | Same Turnstile site → copy the **Secret Key**.                                                                                   |

Missing `TURNSTILE_SECRET_KEY` fails verification closed (forms reject submissions) rather than skipping the check — set both together.

## Email — Resend

Used for transactional email, including the intake-deadline reminder job (`lib/email/send.ts`).

| Variable         | What it's for                                                     | How to get it                                                                                                                                                                                                                               |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY` | Auth for sending email via Resend's API                           | Create a free account at [resend.com](https://resend.com) → **API Keys** → **Create API Key** (Sending access is enough).                                                                                                                   |
| `EMAIL_FROM`     | Verified From address, e.g. `Edu Agency <noreply@yourdomain.com>` | Resend Dashboard → **Domains** → **Add Domain** → add the DNS records they give you → once verified, use any address `@yourdomain.com`. Resend's free tier also gives a `onboarding@resend.dev` sender for testing without your own domain. |

Leaving `RESEND_API_KEY` blank makes email sends a **dry-run** (logged, not sent) — useful for local testing of the reminder job.

## WhatsApp Business Cloud API (Meta)

Used by the lead nurture job (`lib/whatsapp/send.ts`). Missing token or phone-number ID is a dry-run. Template names live in `lib/nurture/sequence.ts`.

| Variable                        | What it's for                                                        | How to get it                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WHATSAPP_ACCESS_TOKEN`         | Long-lived token for sending WhatsApp messages                       | [Meta for Developers](https://developers.facebook.com) → create an app → add the **WhatsApp** product → **API Setup** page gives a temporary token; generate a permanent one via a **System User** in [Meta Business Suite](https://business.facebook.com) → **Business Settings** → **System Users** → assign WhatsApp permissions → **Generate Token**. |
| `WHATSAPP_PHONE_NUMBER_ID`      | ID of the sending phone number                                       | Same app's **WhatsApp → API Setup** page, under "From" — copy the **Phone number ID**.                                                                                                                                                                                                                                                                    |
| `WHATSAPP_BUSINESS_ACCOUNT_ID`  | WABA ID for template/account management                              | Same page, or **Business Settings** → **Accounts** → **WhatsApp Accounts**.                                                                                                                                                                                                                                                                               |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | String you invent; Meta echoes it back when you register the webhook | Make up any random string yourself (e.g. generate with `openssl rand -hex 20`) and enter the same value in Meta's webhook setup form.                                                                                                                                                                                                                     |
| `WHATSAPP_APP_SECRET`           | Validates `X-Hub-Signature-256` on inbound webhooks                  | Meta App Dashboard → **Settings** → **Basic** → **App Secret** (click "Show").                                                                                                                                                                                                                                                                            |

## Facebook Messenger Platform API — reserved, not wired yet

| Variable                                  | What it's for                                                           | How to get it                                                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Identify your Meta app for the Messenger integration                    | Same [Meta for Developers](https://developers.facebook.com) app as WhatsApp above → **Settings** → **Basic** → App ID and App Secret.           |
| `FACEBOOK_PAGE_ACCESS_TOKEN`              | Token scoped to your agency's Facebook Page                             | Meta App Dashboard → add the **Messenger** product → **Access Tokens** → generate a token for your Page (requires being an admin of that Page). |
| `FACEBOOK_PAGE_ID`                        | The agency's Facebook Page ID                                           | Your Facebook Page → **About** tab (or **Settings** → **Page Info**) — shown as "Page ID".                                                      |
| `FACEBOOK_VERIFY_TOKEN`                   | String you invent; Facebook echoes it back when registering the webhook | Same approach as `WHATSAPP_WEBHOOK_VERIFY_TOKEN` — invent a random string.                                                                      |

## SMS — local Bangladeshi aggregator

Used for the 48-hour intake-deadline SMS reminder (`lib/sms/send.ts`).

| Variable        | What it's for                               | How to get it                                                                                                                                                        |
| --------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SMS_API_URL`   | Aggregator's HTTP endpoint                  | Sign up with a local BD SMS aggregator (e.g. bulksmsbd, SMS.net.bd, or another provider serving Bangladesh) — the base API URL is in their developer docs/dashboard. |
| `SMS_API_KEY`   | Auth token/API key for that aggregator      | Same aggregator dashboard → **API** or **Developer** section → generate an API key.                                                                                  |
| `SMS_SENDER_ID` | Approved sender ID/mask shown to recipients | Requested/approved through the aggregator's portal (Bangladesh telecom regulation requires pre-approved sender IDs).                                                 |

Leaving `SMS_API_URL` or `SMS_API_KEY` blank makes SMS sends a **dry-run** (logged, not sent) — the reminder job still runs and still records `reminders_sent`.

## AI — Groq, Gemini, OpenRouter

Used by the chat/matching gateway (`lib/ai/`). All optional — the gateway skips a provider whose key is blank and falls through its chain.

| Variable             | What it's for                                                             | How to get it                                                                                                   |
| -------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `GROQ_API_KEY`       | Fast Llama inference; first in the "chat" chain                           | Create a free account at [console.groq.com](https://console.groq.com/keys) → **API Keys** → **Create API Key**. |
| `GEMINI_API_KEY`     | Gemini Flash; first in the "matching" chain                               | [Google AI Studio](https://aistudio.google.com/app/apikey) → **Get API key** → **Create API key**.              |
| `OPENROUTER_API_KEY` | `:free` last-resort model in both chains                                  | [openrouter.ai](https://openrouter.ai/keys) → sign in → **Keys** → **Create Key**.                              |
| `ANTHROPIC_API_KEY`  | Reserved for future Claude-based assistants — not read by the gateway yet | [console.anthropic.com](https://console.anthropic.com/settings/keys) → **Create Key**.                          |
| `OPENAI_API_KEY`     | Reserved alternative/companion to Anthropic — not read yet                | [platform.openai.com](https://platform.openai.com/api-keys) → **Create new secret key**.                        |

## Background jobs — Inngest (intake-deadline reminders)

Trigger.dev is listed as an alternative in `.env.example`, but the reminder job (`lib/inngest/`, `app/api/inngest/route.ts`) is built on **Inngest**.

| Variable                  | What it's for                                                                             | How to get it                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TRIGGER_SECRET_KEY`      | Reserved if you ever switch to Trigger.dev instead — not used by the current reminder job | [trigger.dev](https://trigger.dev) → create a project → **API Keys**. Not needed with the current Inngest setup.                                                                    |
| `INNGEST_EVENT_KEY`       | Lets the app send events to Inngest Cloud (production)                                    | [app.inngest.com](https://app.inngest.com) → create an app → **Manage** → **Event Keys** → copy the default key (or create one). Not required for local dev with `inngest-cli dev`. |
| `INNGEST_SIGNING_KEY`     | Lets Inngest Cloud verify requests to your `/api/inngest` route (production)              | Same Inngest app → **Manage** → **Signing Key**. Not required for local dev.                                                                                                        |
| `INTAKE_REMINDER_WINDOWS` | Comma-separated calendar days (Dhaka) before a deadline to remind, default `14,7,2`       | No signup — just a config value. Leave as-is unless you want different windows.                                                                                                     |

For local development you don't need Inngest Cloud keys at all: run `npm run dev`, then in another terminal `npx inngest-cli@latest dev -u http://localhost:3000/api/inngest` (see the README's "Intake deadline reminders" section).

## Monitoring — Sentry — reserved, not wired yet

| Variable                 | What it's for                                                         | How to get it                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SENTRY_DSN`             | Server/edge error reporting endpoint                                  | Create a free account at [sentry.io](https://sentry.io) → **Create Project** (Next.js) → copy the DSN from **Settings** → **Client Keys (DSN)**. |
| `NEXT_PUBLIC_SENTRY_DSN` | Same DSN, exposed to the browser bundle for client-side error capture | Same value as `SENTRY_DSN` (Sentry DSNs are safe to expose publicly).                                                                            |
| `SENTRY_AUTH_TOKEN`      | Uploads source maps during CI builds                                  | Sentry → **Settings** → **Auth Tokens** → **Create New Token** (scopes: `project:releases`, `org:read`).                                         |
| `SENTRY_ORG`             | Your Sentry organization slug                                         | Visible in the Sentry dashboard URL (`sentry.io/organizations/<slug>/...`) or **Settings** → **General**.                                        |
| `SENTRY_PROJECT`         | Your Sentry project slug                                              | **Settings** → **Projects** → your project's slug.                                                                                               |

## Analytics — PostHog — reserved, not wired yet

| Variable                   | What it's for                      | How to get it                                                                                                                                          |
| -------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Project API key for event tracking | Free account at [posthog.com](https://posthog.com) → **Project Settings** → copy the **Project API Key**.                                              |
| `NEXT_PUBLIC_POSTHOG_HOST` | Ingestion host                     | Same **Project Settings** page — typically `https://us.i.posthog.com` or `https://eu.i.posthog.com` depending on your region, or your self-hosted URL. |

## Analytics — Google Analytics / Search Console — reserved, not wired yet

| Variable                        | What it's for      | How to get it                                                                                                                                       |
| ------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID | [analytics.google.com](https://analytics.google.com) → **Admin** → **Data Streams** → your web stream → copy the **Measurement ID** (`G-XXXXXXXX`). |

---

## Quick reference: minimum setups

- **Just want the app to boot:** fill in the 4 vars under "Required now".
- **Test the intake-reminder job end-to-end:** boot vars + run `npm run db:migrate`, then `npm run reminders:run`. Resend/SMS keys are optional — missing ones dry-run and still log to `reminders_sent`.
- **Test lead nurture:** boot vars + `npm run db:migrate`, then `npm run nurture:run`. WhatsApp and Resend keys are optional (dry-run). Sequence timing is `lib/nurture/sequence.ts`, not env.
- **Test public forms (leads/contact/eligibility) with real spam protection:** add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`, and ideally `UPSTASH_REDIS_REST_URL`/`TOKEN` for rate limiting.
- **Test document uploads:** add all five `R2_*` vars (private bucket) — `R2_PUBLIC_BASE_URL` is separate and only needed for success-story photos.
- **Test AI chat/matching:** add any one of `GROQ_API_KEY` / `GEMINI_API_KEY` / `OPENROUTER_API_KEY` — the gateway chains through whichever are present.
