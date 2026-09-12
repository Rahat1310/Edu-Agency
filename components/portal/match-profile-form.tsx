"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { saveMatchProfile } from "@/app/portal/matches/actions";
import {
  budgetBands,
  educationLevels,
  eligibilityDestinations,
  type EligibilityDestination,
} from "@/lib/eligibility";
import { matchBudgetLabels, matchEducationLabels } from "@/lib/matching/copy";
import type { MatchProfileDraft } from "@/lib/matching/types";
import { programCountryLabels } from "@/lib/programs-labels";
import { matchProfileFormSchema } from "@/lib/schemas/match-profile";
import { cn } from "@/lib/utils";

const inputClass =
  "desk-focus mt-1.5 w-full rounded-xl border border-[var(--desk-line)] bg-white px-3 py-2.5 text-sm text-[var(--desk-ink)]";

const IELTS_OPTIONS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] as const;

type MatchProfileFormProps = {
  draft: MatchProfileDraft;
  pending: boolean;
  startPending: (callback: () => void | Promise<void>) => void;
  onSaved: () => void;
};

export function MatchProfileForm({
  draft,
  pending,
  startPending,
  onSaved,
}: MatchProfileFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(matchProfileFormSchema),
    defaultValues: {
      educationLevel:
        draft.educationLevel === "" ? undefined : draft.educationLevel,
      destinations: draft.destinations,
      ielts: draft.ielts,
      toefl: draft.toefl,
      hsk: draft.hsk,
      topik: draft.topik,
      budget: draft.budget === "" ? undefined : draft.budget,
    },
  });

  const destinations = form.watch("destinations") ?? [];

  function toggleDestination(value: EligibilityDestination) {
    const next = destinations.includes(value)
      ? destinations.filter((item) => item !== value)
      : [...destinations, value];
    form.setValue("destinations", next, { shouldValidate: true });
  }

  return (
    <form
      className="space-y-5"
      aria-busy={pending}
      onSubmit={form.handleSubmit((values) => {
        setFormError(null);
        startPending(async () => {
          const result = await saveMatchProfile(values);
          if (result.error) {
            setFormError(
              result.error === "Validation failed"
                ? "Check the fields below, then save again."
                : result.error,
            );
            return;
          }
          onSaved();
        });
      })}
    >
      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-[var(--desk-line)] bg-[var(--desk-bg)] px-4 py-3 text-sm text-[var(--desk-ink)]"
        >
          {formError}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="match-education"
          className="text-sm font-semibold text-[var(--desk-accent)]"
        >
          Current education
        </label>
        <select
          id="match-education"
          className={inputClass}
          aria-invalid={Boolean(form.formState.errors.educationLevel)}
          {...form.register("educationLevel")}
        >
          <option value="">Choose a level</option>
          {educationLevels.map((value) => (
            <option key={value} value={value}>
              {matchEducationLabels[value]}
            </option>
          ))}
        </select>
        <FieldError message={form.formState.errors.educationLevel?.message} />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-[var(--desk-accent)]">
          Destinations you are considering
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {eligibilityDestinations.map((value) => {
            const selected = destinations.includes(value);
            return (
              <label
                key={value}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center rounded-xl border px-3 text-sm font-semibold",
                  selected
                    ? "border-[var(--desk-accent)] bg-[var(--desk-surface-muted)] text-[var(--desk-accent)]"
                    : "border-[var(--desk-line)] bg-white text-[var(--desk-ink)]",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selected}
                  onChange={() => toggleDestination(value)}
                />
                {programCountryLabels[value]}
              </label>
            );
          })}
        </div>
        <FieldError message={form.formState.errors.destinations?.message} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="match-ielts"
            className="text-sm font-semibold text-[var(--desk-accent)]"
          >
            IELTS overall (if taken)
          </label>
          <select
            id="match-ielts"
            className={inputClass}
            {...form.register("ielts")}
          >
            <option value="">Not taken</option>
            {IELTS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="match-toefl"
            className="text-sm font-semibold text-[var(--desk-accent)]"
          >
            TOEFL iBT (if taken)
          </label>
          <input
            id="match-toefl"
            className={inputClass}
            type="number"
            min={0}
            max={120}
            inputMode="numeric"
            placeholder="Not taken"
            {...form.register("toefl")}
          />
        </div>
        <div>
          <label
            htmlFor="match-hsk"
            className="text-sm font-semibold text-[var(--desk-accent)]"
          >
            HSK level (if taken)
          </label>
          <select
            id="match-hsk"
            className={inputClass}
            {...form.register("hsk")}
          >
            <option value="">Not taken</option>
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="match-topik"
            className="text-sm font-semibold text-[var(--desk-accent)]"
          >
            TOPIK level (if taken)
          </label>
          <select
            id="match-topik"
            className={inputClass}
            {...form.register("topik")}
          >
            <option value="">Not taken</option>
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-[var(--desk-accent)]">
          Rough yearly tuition budget (BDT)
        </legend>
        <p className="mt-1 text-sm text-[var(--desk-ink-muted)]">
          We use this to drop programs whose tuition is clearly above the band.
          Living costs are not in this cut.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {budgetBands.map((value) => (
            <label
              key={value}
              className={cn(
                "flex min-h-11 cursor-pointer items-center rounded-xl border px-3 text-sm font-semibold",
                form.watch("budget") === value
                  ? "border-[var(--desk-accent)] bg-[var(--desk-surface-muted)] text-[var(--desk-accent)]"
                  : "border-[var(--desk-line)] bg-white text-[var(--desk-ink)]",
              )}
            >
              <input
                type="radio"
                value={value}
                className="sr-only"
                {...form.register("budget")}
              />
              {matchBudgetLabels[value]}
            </label>
          ))}
        </div>
        <FieldError message={form.formState.errors.budget?.message} />
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="desk-focus desk-press inline-flex min-h-11 items-center rounded-full bg-[var(--desk-accent)] px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save and match"}
      </button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 text-sm text-[var(--destructive)]" role="alert">
      {message}
    </p>
  );
}
