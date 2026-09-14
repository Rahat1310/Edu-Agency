"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { addLeadNote, assignLeadCounselor } from "@/app/admin/leads/actions";
import { AutomationHistory } from "@/components/desk/automation-history";
import { DeskDrawer } from "@/components/desk/drawer";
import { DeskErrorState } from "@/components/desk/error-state";
import { LeadDocuments } from "@/components/desk/lead-documents";
import { LeadVisaSection } from "@/components/desk/lead-visa-section";
import { MessageThread } from "@/components/desk/message-thread";
import { DeskDetailSkeleton } from "@/components/desk/skeleton";
import { useDeskToast } from "@/components/desk/toast";
import type { StudentDocumentRow } from "@/lib/documents/types";
import type { LeadActivityItem } from "@/lib/leads/activity-types";
import type { AssignableCounselor } from "@/lib/leads/counselors";
import {
  formatLeadDate,
  leadDestinationLabels,
  leadStatusLabels,
} from "@/lib/leads/labels";
import type { LeadDetail } from "@/lib/leads/list-types";
import type {
  DeskAutomationEvent,
  DeskThreadMessage,
} from "@/lib/messages/types";
import { isVisaPipelineStage } from "@/lib/visa-applications/stage";
import type { DeskVisaApplication } from "@/lib/visa-applications/types";

const EMPTY_ACTIVITY: LeadActivityItem[] = [];
const EMPTY_DOCUMENTS: StudentDocumentRow[] = [];
const EMPTY_MESSAGES: DeskThreadMessage[] = [];
const EMPTY_AUTOMATION: DeskAutomationEvent[] = [];
const EMPTY_COUNSELORS: AssignableCounselor[] = [];

type LeadDetailPanelProps = {
  lead: LeadDetail | null;
  activity?: LeadActivityItem[];
  documents?: StudentDocumentRow[];
  messages?: DeskThreadMessage[];
  automationHistory?: DeskAutomationEvent[];
  visaApplication?: DeskVisaApplication | null;
  hasLinkedApplication?: boolean;
  visaLoadError?: boolean;
  counselors?: AssignableCounselor[];
  actorLabel: string;
  loading?: boolean;
  missing?: boolean;
  loadError?: boolean;
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
        {label}
      </dt>
      <dd className="mt-1 break-words whitespace-pre-wrap">{value || "—"}</dd>
    </div>
  );
}

function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : `https://wa.me/${phone}`;
}

export function LeadDetailPanel({
  lead,
  activity = EMPTY_ACTIVITY,
  documents = EMPTY_DOCUMENTS,
  messages = EMPTY_MESSAGES,
  automationHistory = EMPTY_AUTOMATION,
  visaApplication = null,
  hasLinkedApplication = false,
  visaLoadError = false,
  counselors = EMPTY_COUNSELORS,
  actorLabel,
  loading = false,
  missing = false,
  loadError = false,
}: LeadDetailPanelProps) {
  const { toast } = useDeskToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState(activity);
  const [files, setFiles] = useState(documents);
  const [visa, setVisa] = useState(visaApplication);
  const [assignedCounselorId, setAssignedCounselorId] = useState(
    lead?.assignedCounselorId ?? null,
  );
  const [note, setNote] = useState("");
  const [shareWithStudent, setShareWithStudent] = useState(false);
  const [saving, setSaving] = useState(false);
  const feedEndRef = useRef<HTMLLIElement>(null);
  const lastLeadIdRef = useRef<string | null>(null);

  const leadId = lead?.id ?? "";
  const open = Boolean(lead) || loading || missing || loadError;

  function onClose() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lead");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (!leadId) {
      lastLeadIdRef.current = null;
      return;
    }

    if (lastLeadIdRef.current !== leadId) {
      lastLeadIdRef.current = leadId;
      setItems(activity);
      setFiles(documents);
      setVisa(visaApplication);
      setAssignedCounselorId(lead?.assignedCounselorId ?? null);
    }
  }, [leadId, activity, documents, visaApplication, lead?.assignedCounselorId]);

  useEffect(() => {
    setNote("");
    setShareWithStudent(false);
  }, [leadId]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [items.length]);

  async function onAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead || saving) {
      return;
    }

    const content = note.trim();
    if (!content) {
      return;
    }

    const share = shareWithStudent;
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: LeadActivityItem = {
      id: tempId,
      type: "note",
      content,
      fromStatus: null,
      toStatus: null,
      createdAt: new Date().toISOString(),
      actorLabel,
      isVisibleToStudent: share,
    };

    setSaving(true);
    setNote("");
    setShareWithStudent(false);
    setItems((current) => [...current, optimistic]);

    const result = await addLeadNote({
      leadId: lead.id,
      content,
      isVisibleToStudent: share,
    });

    if (!result.ok) {
      setItems((current) => current.filter((item) => item.id !== tempId));
      setNote(content);
      setShareWithStudent(share);
      toast({
        title: "Note not saved",
        description: result.message,
        tone: "warn",
      });
      setSaving(false);
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === tempId ? result.activity : item)),
    );
    setSaving(false);
  }

  return (
    <DeskDrawer
      open={open}
      title={
        lead?.name ??
        (loadError
          ? "Could not open lead"
          : missing
            ? "Lead not found"
            : "Lead")
      }
      onClose={onClose}
      className="max-w-lg"
      footer={
        lead ? (
          <form onSubmit={onAddNote} className="space-y-2">
            <label className="block text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
              Add note
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                maxLength={4000}
                required
                disabled={saving}
                placeholder="Append-only. Notes cannot be edited later."
                className="desk-focus mt-1 w-full resize-y rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2 py-1.5 text-sm font-normal text-[var(--desk-ink)] normal-case"
              />
            </label>
            <label className="flex items-start gap-2 text-xs leading-5 text-[var(--desk-ink)]">
              <input
                type="checkbox"
                className="desk-focus mt-0.5 size-3.5 rounded-[0.2rem] border-[var(--desk-line)]"
                checked={shareWithStudent}
                disabled={saving}
                onChange={(event) => setShareWithStudent(event.target.checked)}
              />
              <span>
                Share on the student&apos;s dashboard
                <span className="mt-0.5 block text-[var(--desk-ink-muted)]">
                  Stays internal unless you tick this.
                </span>
              </span>
            </label>
            <button
              type="submit"
              disabled={saving || note.trim().length === 0}
              className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2.5 text-xs font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save note"}
            </button>
          </form>
        ) : null
      }
    >
      {loading ? <DeskDetailSkeleton /> : null}
      {loadError ? (
        <DeskErrorState
          title="This lead could not be loaded"
          body="The queue is still there. Try opening the lead again."
          onRetry={() => router.refresh()}
        />
      ) : null}
      {missing ? (
        <p className="text-sm text-[var(--desk-ink-muted)]">
          This lead is no longer in the desk. It may have been removed, or the
          link is out of date.
        </p>
      ) : null}
      {lead ? (
        <div className="space-y-6">
          <dl className="space-y-3 text-sm">
            <Field label="Status" value={leadStatusLabels[lead.status]} />
            <LeadCounselorField
              leadId={lead.id}
              assignedCounselorId={assignedCounselorId}
              counselors={counselors}
              onUpdated={(nextId, activityItem) => {
                setAssignedCounselorId(nextId);
                if (activityItem) {
                  setItems((current) => [...current, activityItem]);
                }
              }}
            />
            <Field
              label="Destination"
              value={leadDestinationLabels[lead.destinationInterest]}
            />
            <div>
              <dt className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
                Phone
              </dt>
              <dd className="mt-1">
                <a
                  href={`tel:${lead.phone}`}
                  className="desk-focus rounded-[var(--desk-radius)] text-[var(--desk-accent-2)]"
                >
                  {lead.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
                WhatsApp
              </dt>
              <dd className="mt-1">
                {lead.whatsapp ? (
                  <a
                    href={whatsappHref(lead.whatsapp)}
                    className="desk-focus rounded-[var(--desk-radius)] text-[var(--desk-accent-2)]"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lead.whatsapp}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
                Email
              </dt>
              <dd className="mt-1">
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="desk-focus rounded-[var(--desk-radius)] text-[var(--desk-accent-2)]"
                  >
                    {lead.email}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <Field label="Source" value={lead.source} />
            <Field label="Created" value={formatLeadDate(lead.createdAt)} />
            <Field label="Message" value={lead.message} />
          </dl>

          <QuizFields value={lead.quizAnswers} />

          <MessageThread messages={messages} />

          <LeadDocuments
            leadId={lead.id}
            documents={files}
            onReviewed={(document, activityItem) => {
              setFiles((current) =>
                current.map((file) =>
                  file.id === document.id ? document : file,
                ),
              );
              if (activityItem) {
                setItems((current) => [...current, activityItem]);
              }
            }}
          />

          {isVisaPipelineStage(lead.status) ||
          process.env.NODE_ENV !== "production" ? (
            <LeadVisaSection
              leadId={lead.id}
              visa={visa}
              hasLinkedApplication={hasLinkedApplication}
              loadError={visaLoadError}
              inVisaStage={isVisaPipelineStage(lead.status)}
              onUpdated={(nextVisa, activityItem) => {
                setVisa(nextVisa);
                if (activityItem) {
                  setItems((current) => [...current, activityItem]);
                }
              }}
            />
          ) : null}

          <AutomationHistory events={automationHistory} />

          <section>
            <h3 className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
              History
            </h3>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--desk-ink-muted)]">
                No notes or stage changes yet — add the first note below.
              </p>
            ) : (
              <ol className="mt-2 space-y-2">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    ref={index === items.length - 1 ? feedEndRef : undefined}
                  >
                    <ActivityItem item={item} />
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      ) : null}
    </DeskDrawer>
  );
}

function ActivityItem({ item }: { item: LeadActivityItem }) {
  if (item.type === "stage_change") {
    const from = item.fromStatus
      ? leadStatusLabels[item.fromStatus]
      : "Unknown";
    const to = item.toStatus ? leadStatusLabels[item.toStatus] : "Unknown";

    return (
      <article className="rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2.5 py-2">
        <p className="text-[0.65rem] font-semibold tracking-[0.06em] text-[var(--desk-accent)] uppercase">
          Stage change
        </p>
        <p className="mt-1 text-sm">
          {from}
          <span
            className="mx-1 text-[var(--desk-ink-muted)]"
            aria-hidden="true"
          >
            →
          </span>
          {to}
        </p>
        <ActivityMeta item={item} />
      </article>
    );
  }

  if (item.type === "system") {
    return (
      <article className="rounded-[var(--desk-radius)] border border-dashed border-[var(--desk-line)] px-2.5 py-2">
        <p className="text-[0.65rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          System
        </p>
        <p className="mt-1 text-sm whitespace-pre-wrap">
          {item.content || "System event"}
        </p>
        <ActivityMeta item={item} />
      </article>
    );
  }

  return (
    <article className="rounded-[var(--desk-radius)] border border-[var(--desk-line)] px-2.5 py-2">
      <p className="text-[0.65rem] font-semibold tracking-[0.06em] text-[var(--desk-ink)] uppercase">
        Note
        {item.isVisibleToStudent ? (
          <span className="ml-1.5 font-medium tracking-normal text-[var(--desk-accent-2)] normal-case">
            Shared with student
          </span>
        ) : null}
      </p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{item.content}</p>
      <ActivityMeta item={item} />
    </article>
  );
}

function ActivityMeta({ item }: { item: LeadActivityItem }) {
  return (
    <p className="mt-1 text-[0.7rem] text-[var(--desk-ink-muted)]">
      {item.actorLabel}
      <span className="mx-1" aria-hidden="true">
        ·
      </span>
      {formatLeadDate(item.createdAt)}
    </p>
  );
}

const educationLabels: Record<string, string> = {
  hsc: "HSC",
  bachelor: "Bachelor",
  master: "Master",
  diploma: "Diploma",
};

const budgetLabels: Record<string, string> = {
  under_8l: "Under 8 lakh",
  "8_15l": "8–15 lakh",
  "15_25l": "15–25 lakh",
  over_25l: "Over 25 lakh",
};

const verdictLabels: Record<string, string> = {
  strong: "Strong",
  possible: "Possible",
  stretch: "Stretch",
};

function LeadCounselorField({
  leadId,
  assignedCounselorId,
  counselors,
  onUpdated,
}: {
  leadId: string;
  assignedCounselorId: string | null;
  counselors: AssignableCounselor[];
  onUpdated: (
    assignedCounselorId: string | null,
    activity: LeadActivityItem | null,
  ) => void;
}) {
  const { toast } = useDeskToast();
  const [saving, setSaving] = useState(false);
  const options = counselorOptions(assignedCounselorId, counselors);

  async function onChange(nextId: string) {
    if (saving) {
      return;
    }

    const current = assignedCounselorId ?? "";
    if (nextId === current) {
      return;
    }

    setSaving(true);
    const result = await assignLeadCounselor({
      leadId,
      counselorId: nextId,
    });

    if (!result.ok) {
      toast({
        title: "Assignment not saved",
        description: result.message,
        tone: "warn",
      });
      setSaving(false);
      return;
    }

    onUpdated(result.assignedCounselorId, result.activity);
    toast({
      title:
        result.activity === null ? "Already assigned" : "Counselor updated",
      description:
        result.assignedCounselorId === null
          ? "This file no longer counts on a counselor's performance stats."
          : "This file now counts toward that counselor's performance stats.",
      tone: "ok",
    });
    setSaving(false);
  }

  return (
    <div>
      <label className="block text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
        Counselor
        <select
          className="desk-focus mt-1 w-full rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2 py-1.5 text-sm font-normal text-[var(--desk-ink)] normal-case"
          value={assignedCounselorId ?? ""}
          disabled={saving}
          onChange={(event) => void onChange(event.target.value)}
        >
          <option value="">Unassigned</option>
          {options.map((row) => (
            <option key={row.id} value={row.id}>
              {row.label}
            </option>
          ))}
        </select>
      </label>
      {options.length === 0 ? (
        <p className="mt-1 text-xs text-[var(--desk-ink-muted)]">
          No counselor accounts to assign yet.
        </p>
      ) : null}
    </div>
  );
}

function counselorOptions(
  assignedCounselorId: string | null,
  counselors: AssignableCounselor[],
): AssignableCounselor[] {
  if (
    !assignedCounselorId ||
    counselors.some((row) => row.id === assignedCounselorId)
  ) {
    return counselors;
  }

  return [
    ...counselors,
    {
      id: assignedCounselorId,
      label: "Inactive counselor",
      role: "counselor",
    },
  ];
}

function QuizFields({ value }: { value: unknown }) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const quiz = value as Record<string, unknown>;
  const result =
    quiz.result && typeof quiz.result === "object"
      ? (quiz.result as Record<string, unknown>)
      : null;

  const destination =
    typeof quiz.destination === "string"
      ? leadDestinationLabels[
          quiz.destination as keyof typeof leadDestinationLabels
        ]
      : undefined;

  if (!destination && !result) {
    return null;
  }

  return (
    <section>
      <h3 className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
        Eligibility quiz
      </h3>
      <dl className="mt-2 space-y-2 text-sm">
        <Field
          label="Education"
          value={
            typeof quiz.educationLevel === "string"
              ? (educationLabels[quiz.educationLevel] ?? quiz.educationLevel)
              : null
          }
        />
        <Field label="Quiz destination" value={destination ?? null} />
        <Field
          label="Budget"
          value={
            typeof quiz.budget === "string"
              ? (budgetLabels[quiz.budget] ?? quiz.budget)
              : null
          }
        />
        <Field
          label="IELTS"
          value={typeof quiz.ielts === "number" ? String(quiz.ielts) : null}
        />
        <Field
          label="TOEFL"
          value={typeof quiz.toefl === "number" ? String(quiz.toefl) : null}
        />
        <Field
          label="HSK"
          value={typeof quiz.hsk === "number" ? String(quiz.hsk) : null}
        />
        <Field
          label="TOPIK"
          value={typeof quiz.topik === "number" ? String(quiz.topik) : null}
        />
        <Field
          label="Verdict"
          value={
            typeof result?.verdict === "string"
              ? (verdictLabels[result.verdict] ?? result.verdict)
              : null
          }
        />
      </dl>
    </section>
  );
}
