"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ApplicationCase } from "@/lib/applications/load";
import {
  formStatusLabels,
  universityReviewLabels,
} from "@/lib/applications/schema";
import { leadStatuses } from "@/db/schema";
import { leadStatusLabels } from "@/lib/leads/labels";
import { MatchCard } from "@/components/portal/match-card";
import { PortalInfoDrawer } from "@/components/portal/info-drawer";
import { PortalEmptyState } from "@/components/portal/portal-empty-state";
import { VisaChecklistSection } from "@/components/portal/visa-checklist";
import { VisaStatusSection } from "@/components/portal/visa-status-section";
import { isVisaPipelineStage } from "@/lib/visa-applications/stage";
import type { LeadDestinationInterest, LeadStatus } from "@/db/schema";
import type { StudentActivityItem } from "@/lib/leads/activity-types";
import { formatLeadDate } from "@/lib/leads/labels";
import type { PortalMatchRanking } from "@/lib/matching/types";
import { destinationLine } from "@/lib/portal/copy";
import { preDepartureDashboardHref } from "@/lib/pre-departure/dashboard-href";
import { programCountryLabels } from "@/lib/programs-labels";
import { programCountryFromLeadDestination } from "@/lib/visa-requirements/destination";
import type { VisaChecklist } from "@/lib/visa-requirements/checklist";
import {
  portalGuideFor,
  portalTasksFor,
  type PortalTask,
} from "@/lib/portal-tasks";
import { getWhatsAppHref } from "@/lib/whatsapp";
export function PortalDashboard({
  name,
  destination,
  status,
  activity,
  applicationCase = null,
  forbidden = false,
  ranking = null,
  checklist,
  checklistError = false,
  visaLine = null,
  visaStatusError = false,
}: {
  name: string;
  destination: LeadDestinationInterest;
  status: LeadStatus;
  activity: StudentActivityItem[];
  applicationCase?: ApplicationCase | null;
  forbidden?: boolean;
  ranking?: PortalMatchRanking | null;
  checklist: VisaChecklist;
  checklistError?: boolean;
  visaLine?: string | null;
  visaStatusError?: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 60000);
    return () => window.clearInterval(timer);
  }, [router]);
  const guide = portalGuideFor(status);
  const tasks = portalTasksFor(status);
  const preDepartureHref = preDepartureDashboardHref(destination, status);
  const lockedCountry = programCountryFromLeadDestination(destination);
  const whatsappHref = getWhatsAppHref(
    `Hi, I'm ${name}. I'm checking my file in the student portal.`,
  );
  const feed = activity;
  return (
    <div className="space-y-3">
      <div className="mx-auto max-w-2xl">
        {forbidden ? (
          <p
            role="alert"
            className="mb-6 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-4 py-3 text-sm text-[var(--desk-ink)]"
          >
            That page is for counselors. You&apos;re in the right place here —
            this is your file.
          </p>
        ) : null}

        <p className="font-utility text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--brand-green)] uppercase">
          Dashboard
        </p>

        {applicationCase && (
          <section className="mt-6 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="text-lg font-semibold">My application</h2>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-900">
                {formStatusLabels[applicationCase.formStatus]}
              </span>
            </div>
            <p className="mt-3 text-sm">
              {applicationCase.data.preferredUniversity ||
                "Tell us your preferred university"}
              {applicationCase.data.course
                ? ` · ${applicationCase.data.course}`
                : ""}
            </p>
            <p className="mt-2 text-sm font-medium">
              {universityReviewLabels[applicationCase.universityReview]}
            </p>
            {applicationCase.proposedUniversity && (
              <p className="mt-2 text-sm">
                Suggested / agreed university:{" "}
                {applicationCase.proposedUniversity}
              </p>
            )}
            {applicationCase.universityNote && (
              <p className="mt-2 text-sm leading-7 whitespace-pre-wrap">
                {applicationCase.universityNote}
              </p>
            )}
            {applicationCase.reviewMessage && (
              <p className="mt-3 rounded-lg bg-orange-50 p-3 text-sm leading-7 whitespace-pre-wrap text-slate-800">
                {applicationCase.reviewMessage}
              </p>
            )}
            <Link
              href="/portal/application"
              className="desk-focus mt-4 inline-flex min-h-11 items-center font-semibold underline"
            >
              {applicationCase.formStatus === "submitted"
                ? "View application"
                : "Complete your application"}
            </Link>
          </section>
        )}
        <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--desk-accent)]">
          Hi, {name}.
        </h1>
        <p className="mt-2 text-base leading-7 text-[var(--desk-ink-muted)]">
          This is your study-abroad file. We&apos;ll keep it in one place so you
          and your family can see where things stand.
        </p>

        <section className="mt-8 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
          <p className="font-utility text-[0.68rem] font-semibold tracking-[0.08em] text-[var(--desk-ink-muted)] uppercase">
            Where you are
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
            {guide.headline}
          </h2>
          <p className="mt-2 text-[0.95rem] leading-6 text-[var(--desk-ink)]">
            {guide.summary}
          </p>
          <p className="mt-3 text-sm text-[var(--desk-ink-muted)]">
            {destinationLine(destination)}
          </p>
          <div className="mt-5">
            <PortalInfoDrawer
              triggerLabel="What this stage means"
              title="Where you are right now"
            >
              <p>{guide.summary}</p>
              <p className="text-[var(--desk-ink-muted)]">
                {destinationLine(destination)}
              </p>
              {visaLine ? <p>{visaLine}</p> : null}
            </PortalInfoDrawer>
          </div>
          <ol
            aria-label="Application processing stages"
            className="mt-5 flex flex-wrap gap-2"
          >
            {leadStatuses.map((stage) => (
              <li
                key={stage}
                aria-current={stage === status ? "step" : undefined}
                className={`rounded-full border px-3 py-2 text-xs font-semibold ${stage === status ? "border-[var(--desk-accent)] bg-[var(--desk-accent)] text-white" : "border-[var(--desk-line)] text-[var(--desk-ink-muted)]"}`}
              >
                {leadStatusLabels[stage]}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-[var(--desk-ink-muted)]">
            Your admissions team updates this stage. This page refreshes every
            minute while open.
          </p>
        </section>

        <VisaStatusSection
          status={status}
          visaLine={visaLine}
          loadError={visaStatusError}
        />

        {preDepartureHref && lockedCountry ? (
          <section className="mt-6 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
            <p className="font-utility text-[0.68rem] font-semibold tracking-[0.08em] text-[var(--desk-ink-muted)] uppercase">
              Before you fly
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
              Pre-departure notes for {programCountryLabels[lockedCountry]}
            </h2>
            <p className="mt-2 text-[0.95rem] leading-6 text-[var(--desk-ink)]">
              Review essential arrival notes for student housing, airport
              pickup, SIM setup, and campus orientation. Always confirm flight
              dates and arrival arrangements with your counselor before making
              travel bookings.
            </p>
            <Link
              href={preDepartureHref}
              className="desk-focus desk-press mt-4 inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] bg-[var(--desk-bg)] px-4 text-sm font-semibold text-[var(--desk-ink)]"
            >
              Open the pre-departure guide
            </Link>
          </section>
        ) : null}

        {isVisaPipelineStage(status) && (
          <VisaChecklistSection
            checklist={checklist}
            destination={destination}
            loadError={checklistError}
          />
        )}

        <section className="mt-6 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
            Programs that fit this file
          </h2>
          <p className="mt-2 text-[0.95rem] leading-6 text-[var(--desk-ink)]">
            We filter the directory first, then rank a short list. This is not
            an offer, and it is not a scholarship score.
          </p>
          <DashboardMatches ranking={ranking} />
          <Link
            href="/portal/matches"
            className="desk-focus desk-press mt-4 inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] bg-[var(--desk-bg)] px-4 text-sm font-semibold text-[var(--desk-ink)]"
          >
            {ranking?.matches.length ? "See all matches" : "See your matches"}
          </Link>
        </section>

        <section className="mt-6 rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-5">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
            What to do now
          </h2>
          <ol className="mt-4 space-y-4">
            {tasks.map((task, index) => (
              <TaskRow key={task.id} task={task} index={index} />
            ))}
          </ol>
        </section>

        <section className="mt-6">
          <h2 className="px-1 text-lg font-semibold tracking-[-0.02em] text-[var(--desk-accent)]">
            Updates from your counselor
          </h2>
          {feed.length === 0 ? (
            <div className="mt-4">
              <PortalEmptyState
                title="Nothing from your counselor yet — that's normal"
                body="Send your first scan, or WhatsApp us if you already have a question. When someone here writes you on purpose, it shows up here."
                action={
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/portal/documents"
                      className="desk-focus desk-press inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] bg-[var(--desk-bg)] px-4 text-sm font-semibold text-[var(--desk-ink)]"
                    >
                      Send a document
                    </Link>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="desk-focus desk-press inline-flex min-h-11 items-center rounded-full border border-[var(--desk-line)] px-4 text-sm font-semibold text-[var(--desk-ink)]"
                    >
                      WhatsApp us
                    </a>
                  </div>
                }
              />
            </div>
          ) : (
            <ol className="mt-4 space-y-3">
              {feed.map((item) => (
                <li key={item.id}>
                  <StudentUpdate item={item} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <p className="mt-6 text-sm leading-6 text-[var(--desk-ink-muted)]">
          Questions in the evening?{" "}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="desk-focus font-semibold text-[var(--brand-green)]"
          >
            WhatsApp us
          </a>
          . A counselor reads that chat — you won&apos;t get a bot.
        </p>
      </div>
    </div>
  );
}
function DashboardMatches({ ranking }: { ranking: PortalMatchRanking | null }) {
  if (!ranking) {
    return (
      <p className="mt-3 text-sm leading-6 text-[var(--desk-ink-muted)]">
        Save your education, destination, and budget on the matches page first.
      </p>
    );
  }
  if (ranking.error) {
    return (
      <p className="mt-3 text-sm leading-6 text-[var(--desk-ink-muted)]">
        {ranking.error}
      </p>
    );
  }
  if (ranking.emptyShortlist || ranking.matches.length === 0) {
    return (
      <p className="mt-3 text-sm leading-6 text-[var(--desk-ink-muted)]">
        Nothing published passed the destination, level, and tuition filters
        yet.
      </p>
    );
  }
  return (
    <ol className="mt-4 list-none space-y-3">
      {ranking.matches.map((match) => (
        <li key={match.id}>
          <MatchCard match={match} />
        </li>
      ))}
    </ol>
  );
}
function TaskRow({ task, index }: { task: PortalTask; index: number }) {
  const body = (
    <>
      <span
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--desk-surface-muted)] text-[0.7rem] font-semibold text-[var(--desk-accent)]"
        aria-hidden="true"
      >
        {index + 1}
      </span>
      <span>
        <span className="block font-medium text-[var(--desk-ink)]">
          {task.title}
        </span>
        {task.detail ? (
          <span className="mt-1 block text-sm leading-6 text-[var(--desk-ink-muted)]">
            {task.detail}
          </span>
        ) : null}
      </span>
    </>
  );
  if (task.href) {
    return (
      <li>
        <Link
          href={task.href}
          className="desk-focus -m-1 flex gap-3 rounded-xl p-1"
        >
          {body}
        </Link>
      </li>
    );
  }
  return <li className="flex gap-3">{body}</li>;
}
function StudentUpdate({ item }: { item: StudentActivityItem }) {
  const text =
    item.type === "stage_change" && item.toStatus
      ? portalGuideFor(item.toStatus).headline
      : (item.content ?? "An update was shared with you.");
  return (
    <article className="rounded-xl border border-[var(--desk-line)] bg-[var(--desk-bg)] px-3 py-3">
      <p className="text-[0.95rem] leading-6 whitespace-pre-wrap text-[var(--desk-ink)]">
        {text}
      </p>
      <p className="mt-2 text-sm text-[var(--desk-ink-muted)]">
        From {item.fromName}
        <span className="mx-1" aria-hidden="true">
          ·
        </span>
        {formatLeadDate(item.createdAt)}
      </p>
    </article>
  );
}
