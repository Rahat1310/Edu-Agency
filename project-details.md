# Study Abroad Consultancy Platform — Project Details (Master Reference)

## 0. How to Use This Document

This is the base context file. Any AI coding agent (Google Antigravity, Cursor, or otherwise) should read this in full before any implementation prompt is given. It supersedes assumptions from general training — specifically the auth provider, hosting target, and optimization/security requirements in Sections 4, 6, and 7, which were decided by the founder after the original research pass.

**Build tools:** The founder will build this using **Google Antigravity** (Gemini-3-based agentic IDE — good for autonomous, multi-file, plan-then-execute tasks with browser-in-the-loop testing) and **Cursor** (for hands-on, in-the-loop editing). Prompts given to either tool should assume this document as shared context.

---

## 1. Project Context

**What this is:** A student consultancy and admissions agency, founded and solely owned/managed by the founder. Not a client project — this is his own business. It supports students end-to-end: application → admission → visa → arrival at destination.

**Source market:** Bangladesh (students based in Dhaka and other cities).
**Phase 1 destination countries:** China, India, Malaysia, South Korea — each with a distinct application/visa system (Section 11) and visa type (Section 5.4).

**Current stage:** Planning/pre-build. The founder wants a minimum viable version first (Section 9), not the full feature set at once.

---

## 2. Users & Roles

- **Students** — Bangladeshi nationals, based in Bangladesh, applying to universities abroad. Source market, not to be confused with destination countries.
- **Destinations (Phase 1)** — China, India, Malaysia, South Korea.
- **Counselors/admin (internal)** — the founder and future staff managing leads, applications, and documents through a CRM. Roles: counselor, senior counselor, admin, finance, visa officer.

---

## 3. Business & Regulatory Constraints

- **Remittance:** Tuition leaves Bangladesh through Bangladesh Bank foreign-exchange rules — either the traditional "student file" bank process (admission letter, fee estimate, certificates, passport → bank wires tuition directly) or the newer route (Bangladesh Bank circular, Aug 2026) where AD banks issue international cards for tuition/approved education expenses outside the standard forex quota. This is not a generic payment-gateway problem — the platform's job is to generate the correct document checklist per bank/destination and track student-file status, not to process payment itself.
- **Data protection:** Bangladesh's Personal Data Protection Act, 2026 governs data handling: explicit consent before collecting/storing/transferring personal data, breach notification, and a data-residency rule requiring at least one real-time synced copy of "restricted" data inside Bangladesh. Enforcement phases in through May 2027 — design for compliance now.
- **Primary channels:** WhatsApp and Facebook Messenger dominate student-facing communication in Bangladesh. WeChat/KakaoTalk are backend-only, for coordinating with destination-side partners — not for talking to students.

---

## 4. Decided Technology Stack

### Frontend
- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- React Hook Form + Zod (validation, shared schema with backend)
- TanStack Query (client-side caching/retry for portal and CRM dashboards)

### Backend / API
- Next.js Route Handlers for most CRUD (fewer moving parts, better fit for Vercel's serverless model than a separate Express server)
- Existing Node/Express only if a workload genuinely needs a long-running process outside Vercel's function model — don't run both stacks by default

### Database — Neon (Postgres), free tier
- Decided over Supabase for compute burst headroom (up to 2 CU / ~8GB RAM) and instant git-like branching for solo-dev workflow
- **Critical constraint for this project:** Neon's 100 CU-hours/month is billed per minute the compute is awake, not per request, and compute only suspends after 5 minutes idle. This directly drives the caching/query rules in Section 7 — the whole point is keeping the DB able to sleep between bursts.
- ORM: **Drizzle** — lightweight, strong TypeScript inference, low overhead in serverless functions
- Use Neon's serverless HTTP driver (`@neondatabase/serverless`) in Vercel functions, not a persistent pool — pooled connections don't survive serverless cold starts well

### Auth — Clerk (decided)
- Free tier is 50,000 Monthly Retained Users (MRU) as of Feb 2026 — re-verify at clerk.com/pricing before launch since terms shift; MRU is metered differently from plain MAU
- Role-based access via Clerk's organizations/roles for student/counselor/admin/finance/visa-officer separation
- Built-in bot-signup protection and MFA reduce the amount of custom anti-spam code needed for auth flows specifically (see Section 6 for the rest of the surface area)

### File Storage
- **Cloudflare R2** — 10GB free, S3-compatible, zero egress fees (matters for a document-heavy app: transcripts, passports, certificates). Signed/expiring URLs only, never public buckets.

### Hosting — Vercel (free/Hobby) + Neon (free) — see Section 8 caveat before launch
- Static/marketing pages: SSG or ISR, served from Vercel's edge/CDN — near-zero function invocations
- Dynamic pages (portal, CRM): Server Components + selective client fetching, cached where the data allows it

### Caching Layer
- **Upstash Redis** (serverless, free tier) — cache expensive/repeated reads (program directory, destination pages, user session lookups) so they don't hit Neon on every request
- Next.js `fetch` cache + `revalidate` tags for ISR on marketing/program pages
- TanStack Query on the client for dashboard data that doesn't need to be real-time-fresh

### Search
- Postgres full-text search to start (free, built into Neon) — sufficient for a few hundred programs
- Move to Meilisearch/Typesense only once catalog size or filter complexity actually requires it

### Communication
- WhatsApp Business Cloud API (direct from Meta, cheaper than via Twilio)
- Facebook Messenger Platform API (free)
- Resend for transactional email (3,000/month free)
- Local Bangladeshi SMS aggregator for OTP/reminders — cheaper than international gateways for BD numbers

### AI Layer
- Anthropic or OpenAI API for SOP-review assistant, chatbot, document-completeness checks
- pgvector (native to Neon) for embedding-based program matching

### Background Jobs
- Trigger.dev or Inngest (serverless-native, generous free tiers) for nurture sequences and deadline reminders — schedule these to batch, not to poll constantly (polling keeps Neon awake)

### Monitoring
- Sentry (error tracking, ~5k events/month free)
- PostHog (funnel tracking, open-source, generous free tier)
- Google Analytics + Search Console (free, needed for SEO)
- Vercel's own usage dashboard and Neon's usage dashboard — check weekly against the free-tier caps, not just when something breaks

### Testing / CI
- Vitest + Playwright, GitHub Actions (free tier is generous for a solo repo)

---

## 5. Feature Scope

### 5.1 Public Marketing Site
Home, About, Destinations (China/India/Malaysia/South Korea landing pages in Bengali + English), Programs/Universities directory with filters (country, level, field, tuition, intake, IELTS/TOEFL/HSK/TOPIK), cost & scholarship calculator (BDT + local currency), free eligibility/profile assessment quiz (lead magnet → CRM), live chat + WhatsApp/Messenger click-to-chat, webinar/event registration, SEO-optimized pages with structured data.

### 5.2 Student Portal (post-signup)
Dashboard (stages, tasks, deadlines), profile builder, AI program/university matching, Application Tracking System (submitted → under review → offer → conditional → unconditional → visa), document vault with OCR auto-fill and expiry checks, SOP/essay AI assistant + human review, test-prep resource booking, in-app/WhatsApp-synced messaging with counselor, offer comparison tool, mobile-responsive PWA.

### 5.3 Counselor / Admin CRM (the core moat — invest here)
Unified lead capture (site forms, ads, WhatsApp, walk-in, referral), lead scoring + auto-assignment, de-duplication, counselor task queue and follow-up reminders, bulk student import, pre-screening/eligibility auto-check, performance dashboards (conversion, visa success rate by counselor/country/university), commission tracking, per-student audit trail, RBAC.

### 5.4 Visa & Pre-Departure / Post-Arrival
Destination-specific document checklist generator:
- **China** — X1/X2 visa; JW201/JW202 form + admission letter
- **Malaysia** — Student Pass via EMGS; EMGS "Approval to Study" letter → separate Single Entry Visa (eVISA); applicant must be outside Malaysia when applying
- **South Korea** — D-2 (degree) or D-4 (language/non-degree)
- **India** — mandatory Study in India (SII) portal registration first, generating the SII-ID for the e-Student visa

Also: visa status tracker (EMGS/SII sync where possible), mock interview scheduling, pre-departure briefing content per destination, accommodation/airport-pickup partner directory, SIM/bank setup guides, post-arrival check-in workflow.

### 5.5 Payments & Financial Tools
Guided remittance workflow (not a generic gateway) per Section 3, tuition shown in CNY/INR/MYR/KRW with live BDT equivalent, loan/scholarship matching, transparent free-vs-paid tier pricing, invoicing/receipts for consultancy fees in BDT.

### 5.6 AI & Automation
Rules + LLM-assisted program matching, 24/7 multilingual FAQ/lead-qualification chatbot, automated nurture sequences by funnel stage, GPA/percentage grade converter, document completeness check before counselor review.

### 5.7 Communication & Multilingual
WhatsApp Business API and Facebook Messenger as primary channels, full Bengali + English UI, WeChat/KakaoTalk backend-only for partner coordination, localized email/SMS templates.

### 5.8 Growth & Marketing
Referral program, affiliate/sub-agent portal, blog/CMS for country+destination SEO content, funnel analytics (ad click → lead → enrollment → visa).

---

## 6. Security Requirements

- **Auth security:** Clerk handles session management, MFA, and password/credential storage — don't roll custom auth. Enforce role checks server-side on every protected route/handler, never trust a client-side role check alone.
- **Spam/bot protection:** Honeypot fields + CAPTCHA (Cloudflare Turnstile — free, privacy-friendlier than reCAPTCHA) on all public-facing forms (lead capture, eligibility quiz, contact). Rate-limit form submissions and API routes by IP/session via Upstash Redis.
- **Input validation:** Zod schemas on every API route, shared with the frontend forms — reject malformed/oversized payloads before they touch the database.
- **Injection protection:** Drizzle's parameterized queries by default — never build raw SQL by string concatenation.
- **File upload safety:** Validate file type/size server-side (not just client-side) before writing to R2; scan or restrict executable types; serve documents via signed, time-limited URLs only.
- **Headers/transport:** Enforce HTTPS (Vercel default), set CSP, `X-Content-Type-Options`, `X-Frame-Options`/frame-ancestors, and HSTS via `next.config.js` headers.
- **Secrets:** All API keys (Clerk, Neon, R2, WhatsApp, AI providers) in Vercel environment variables, never committed or exposed to the client bundle.
- **Data protection compliance:** Design consent capture and data-residency handling now per Bangladesh's PDPA 2026 (Section 3) rather than retrofitting later.
- **Dependency hygiene:** Dependabot/`npm audit` in CI; pin versions for anything touching auth, payments, or file handling.
- **Abuse monitoring:** Sentry alerts on repeated auth failures or error spikes from a single IP/session — an early signal of scraping or credential-stuffing attempts.

---

## 7. Performance & Cost Optimization (Vercel + Neon free-tier discipline)

The founder's explicit priority: the codebase and query patterns must be correct by design, not just "fast enough" — because both Vercel Hobby and Neon free tier have hard monthly caps, and Neon's cap is specifically about *how long the database stays awake*, not how many rows are touched.

**The core rule:** minimize the number of times, and how long, a request has to wait on Neon.

- **Cache aggressively at every layer:**
  - Static/marketing content → SSG or ISR (`revalidate`), served from Vercel's edge — these should generate **zero** database hits per visitor after the first build/revalidation.
  - Read-heavy, slow-changing data (program directory, destination info) → Upstash Redis cache in front of Neon, with a sensible TTL (minutes-to-hours, not seconds).
  - Client-side dashboard data → TanStack Query with `staleTime` tuned so the portal/CRM doesn't refetch on every focus/mount.
- **Batch, don't poll.** Background jobs (reminders, nurture sequences) should run on a schedule (e.g., every N hours) and process in batches, not hit the DB continuously — continuous polling is exactly what prevents Neon's compute from suspending.
- **Query discipline:**
  - No N+1 queries — use Drizzle's relational query builder or explicit joins, not a loop of per-row queries.
  - Add indexes on every foreign key and every column used in a `WHERE`/`ORDER BY` on a table that will grow (leads, applications, documents).
  - Select only the columns needed, not `SELECT *`, especially on list/dashboard views.
  - Paginate everything — CRM lead lists, application lists, program directory — never load an unbounded result set.
- **Serverless-aware DB access:** use Neon's HTTP driver in Vercel functions (not a long-lived pool), and keep function execution short — a slow function both costs more Vercel compute time and holds a Neon connection open longer.
- **Image/asset optimization:** Next.js `<Image>` for automatic resizing/format negotiation; serve document/media assets from R2 (zero egress cost) rather than through a Vercel function.
- **Monitor before you scale, not after:** check Vercel and Neon usage dashboards weekly once real traffic starts. If traffic reaches a level where Neon effectively never sleeps (worked example from research: roughly a request every 20–25 seconds sustained over 12–14 hours/day already burns the full 100 CU-hour budget), that's the trigger to either move to Neon's paid Launch tier or tighten caching further — not something to discover from an outage.

---

## 8. Hosting Caveat — Read Before Launch

**Vercel's free Hobby plan's terms restrict it to non-commercial, personal use.** This agency takes payments/fees and generates revenue, which puts a production deployment of it on Hobby in conflict with Vercel's terms — regardless of how far under the traffic/resource limits it stays. This has not changed as of mid-2026.

This is the founder's call to make, not a blocker to building — Antigravity/Cursor should build against Vercel/Next.js as decided. But budget for Vercel Pro (~$20/month, currently priced per seat) before or at the point this goes live and starts handling real student payments/data, rather than running a revenue-generating platform on a plan whose terms don't cover it. Cloudflare Pages remains the practical free-and-commercially-permitted fallback if that timing doesn't work out, though it changes the Next.js SSR deployment path.

---

## 9. What's Actually Necessary to Launch (vs. Later)

**Must-have to launch:**
- Business registration + trade license as a consultancy
- Marketing site: home, about, 4 destination pages, contact, inquiry/lead form
- WhatsApp Business + Facebook Page/Messenger set up and monitored
- A basic student pipeline (even simple: lead → contacted → documents → applied → offer → visa → departed) — don't over-build the CRM before there are real students in it
- Manually curated database of 15–20 real programs per destination (Section 11) with accurate tuition/scholarship info
- Document collection (even via email/Drive initially)
- A correct visa/remittance checklist per destination — this is where students actually get stuck
- Bengali + English content throughout

**Can wait until there's traction:**
- AI program-matching engine
- Full custom ATS/document vault (a spreadsheet + shared drive works for the first 50–100 students)
- Payment/card integration — guide students through the bank student-file process manually at first
- Multi-counselor RBAC CRM, commission tracking
- Referral/sub-agent portal
- Native mobile app

---

## 10. Suggested Build Sequence

1. **MVP core:** marketing site + student portal + basic CRM (lead capture, ATS, document upload) on Next.js + Neon + Clerk
2. **Phase 2:** counselor dashboard, AI matching, WhatsApp/Messenger integration, remittance-guidance workflow
3. **Phase 3:** visa/EMGS/SII status tracking, pre-departure content, full Bengali multilingual UI
4. **Phase 4:** analytics, referral/sub-agent system, mobile app

---

## 11. Destination Research Reference

| Destination | Official portal | What it gives you |
|---|---|---|
| **China** | campuschina.org (China Scholarship Council) and cucas.edu.cn (CUCAS, MOE-recognized) | University/program listings, CSC + university scholarships, JW201/JW202 docs, agency-number applications |
| **Malaysia** | educationmalaysia.gov.my and visa.educationmalaysia.gov.my (EMGS) | Institution/course directory, mandatory visa/student-pass processing, status tracking |
| **South Korea** | studyinkorea.go.kr | University/language-institute listings, GKS scholarship search, admission steps |
| **India** | studyinindia.gov.in (SII Portal) | Mandatory SII registration/SII-ID, course search, application submission |

**Research workflow:** treat the official portal as ground truth over aggregators → cross-check tuition/scholarships against the university's own international office page → separate government-funded (CSC, GKS, ICCR-style) from university-funded scholarships → record intake cycles (China/Korea: Spring March + Autumn September; Malaysia: rolling; India: varies, often April–June) → re-verify visa/document requirements every 6 months → once 15–20 verified programs per destination exist, assign ongoing ownership rather than automating scraping across four differently-structured government sites.
