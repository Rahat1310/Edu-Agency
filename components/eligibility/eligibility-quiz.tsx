"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { TurnstileField } from "@/components/turnstile-field";
import type {
  EligibilityDestination,
  EligibilityResult,
} from "@/lib/eligibility";
import {
  budgetBands,
  educationLevels,
  eligibilityDestinations,
} from "@/lib/eligibility";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import type { QuizSubmitResult } from "@/lib/leads/submit-quiz";
import { eligibilityClientSchema } from "@/lib/schemas/eligibility";
import { HONEYPOT_FIELD } from "@/lib/schemas/lead";
import { cn } from "@/lib/utils";
import { getWhatsAppHref } from "@/lib/whatsapp";

export type EligibilityCopy = Dictionary["eligibility"];

const STEPS = [
  "destination",
  "education",
  "tests",
  "budget",
  "contact",
] as const;

type Step = (typeof STEPS)[number];

const IELTS_OPTIONS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] as const;

const inputClass =
  "focus-ring mt-1.5 w-full rounded-xl border border-[var(--input)] bg-white px-3 py-2.5 text-sm text-[var(--brand-ink)]";

type EligibilityQuizProps = {
  copy: EligibilityCopy;
  locale: Locale;
  initialDestination?: EligibilityDestination;
  footerNewTab: string;
};

export function EligibilityQuiz({
  copy,
  locale,
  initialDestination,
  footerNewTab,
}: EligibilityQuizProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const [stepIndex, setStepIndex] = useState(initialDestination ? 1 : 0);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  const form = useForm({
    resolver: zodResolver(eligibilityClientSchema),
    defaultValues: {
      name: "",
      phone: "",
      whatsapp: "",
      email: "",
      educationLevel: undefined,
      destination: initialDestination,
      ielts: undefined,
      toefl: undefined,
      hsk: undefined,
      topik: undefined,
      budget: undefined,
      consent: false,
      turnstileToken: "",
      [HONEYPOT_FIELD]: "",
    },
  });

  const destination = form.watch("destination");
  const step = STEPS[stepIndex] ?? "destination";
  const isLast = step === "contact";

  if (result) {
    return (
      <EligibilityResultCard
        copy={copy}
        locale={locale}
        result={result}
        footerNewTab={footerNewTab}
      />
    );
  }

  return (
    <form
      className="relative space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        setFormError(null);

        const response = await fetch("/api/eligibility-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            source: "eligibility-quiz",
          }),
        });

        let payload: QuizSubmitResult;
        try {
          payload = (await response.json()) as QuizSubmitResult;
        } catch {
          setFormError(copy.genericError);
          setResetSignal((value) => value + 1);
          return;
        }

        if (payload.ok) {
          setResult(payload.result);
          return;
        }

        if (payload.fields) {
          for (const [name, messages] of Object.entries(payload.fields)) {
            const message = messages[0];
            if (!message) {
              continue;
            }
            form.setError(name as keyof typeof values, { message });
          }
        }

        if (payload.code === "turnstile") {
          setFormError(copy.turnstileError);
        } else if (payload.code === "rate_limit") {
          setFormError(copy.rateLimitError);
        } else if (payload.code === "config") {
          setFormError(copy.configError);
        } else if (payload.code === "validation") {
          setFormError(null);
        } else {
          setFormError(payload.message || copy.genericError);
        }

        setResetSignal((value) => value + 1);
      })}
      noValidate
    >
      <ol className="flex flex-wrap gap-2" aria-label={copy.progressLabel}>
        {STEPS.map((item, index) => (
          <li
            key={item}
            className={cn(
              "font-utility rounded-full px-3 py-1 text-[0.68rem] tracking-[0.08em] uppercase",
              index === stepIndex
                ? "bg-[var(--brand-navy)] text-white"
                : index < stepIndex
                  ? "bg-[var(--brand-green)]/15 text-[var(--brand-navy)]"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]",
            )}
          >
            {index + 1}. {copy.steps[item]}
          </li>
        ))}
      </ol>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/8 px-4 py-3 text-sm text-[var(--destructive)]"
        >
          {formError}
        </p>
      ) : null}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor={HONEYPOT_FIELD}>{copy.honeypotLabel}</label>
        <input
          id={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          {...form.register(HONEYPOT_FIELD)}
        />
      </div>

      {step === "destination" ? (
        <fieldset>
          <legend className="text-sm font-bold text-[var(--brand-navy)]">
            {copy.destinationLabel}
          </legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {eligibilityDestinations.map((value) => (
              <label
                key={value}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center rounded-2xl border px-4 text-sm font-semibold shadow-2xs transition-all",
                  destination === value
                    ? "border-orange-400 bg-orange-50 font-bold text-orange-800 shadow-xs"
                    : "border-stone-200 bg-white text-slate-800 hover:border-slate-300",
                )}
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...form.register("destination")}
                />
                {copy.destinations[value]}
              </label>
            ))}
          </div>
          <FieldError message={form.formState.errors.destination?.message} />
        </fieldset>
      ) : null}

      {step === "education" ? (
        <div>
          <label
            htmlFor="quiz-education"
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            {copy.educationLabel}
          </label>
          <select
            id="quiz-education"
            className={inputClass}
            aria-invalid={Boolean(form.formState.errors.educationLevel)}
            {...form.register("educationLevel")}
          >
            <option value="">{copy.educationPlaceholder}</option>
            {educationLevels.map((value) => (
              <option key={value} value={value}>
                {copy.education[value]}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.educationLevel?.message} />
        </div>
      ) : null}

      {step === "tests" ? (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-[var(--brand-ink)]/80">
            {copy.testsIntro}
          </p>
          {destination === "china" ? (
            <ScoreSelect
              id="quiz-hsk"
              label={copy.hskLabel}
              hint={copy.hskHint}
              emptyLabel={copy.notTaken}
              options={[1, 2, 3, 4, 5, 6]}
              error={form.formState.errors.hsk?.message}
              field={form.register("hsk")}
            />
          ) : null}
          {destination === "south_korea" ? (
            <ScoreSelect
              id="quiz-topik"
              label={copy.topikLabel}
              hint={copy.topikHint}
              emptyLabel={copy.notTaken}
              options={[1, 2, 3, 4, 5, 6]}
              error={form.formState.errors.topik?.message}
              field={form.register("topik")}
            />
          ) : null}
          {destination === "china" || destination === "south_korea" ? (
            <p className="text-sm font-bold text-[var(--brand-navy)]">
              {copy.englishOptionalLabel}
            </p>
          ) : null}
          <ScoreSelect
            id="quiz-ielts"
            label={copy.ieltsLabel}
            hint={copy.ieltsHint}
            emptyLabel={copy.notTaken}
            options={[...IELTS_OPTIONS]}
            error={form.formState.errors.ielts?.message}
            field={form.register("ielts")}
          />
          <div>
            <label
              htmlFor="quiz-toefl"
              className="text-sm font-bold text-[var(--brand-navy)]"
            >
              {copy.toeflLabel}
            </label>
            <input
              id="quiz-toefl"
              className={inputClass}
              type="number"
              min={0}
              max={120}
              inputMode="numeric"
              placeholder={copy.notTaken}
              aria-invalid={Boolean(form.formState.errors.toefl)}
              {...form.register("toefl")}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {copy.toeflHint}
            </p>
            <FieldError message={form.formState.errors.toefl?.message} />
          </div>
        </div>
      ) : null}

      {step === "budget" ? (
        <fieldset>
          <legend className="text-sm font-bold text-[var(--brand-navy)]">
            {copy.budgetLabel}
          </legend>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {copy.budgetHint}
          </p>
          <div className="mt-3 space-y-2">
            {budgetBands.map((value) => (
              <label
                key={value}
                className="flex min-h-12 cursor-pointer items-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--brand-ink)] has-[:checked]:border-[var(--brand-navy)] has-[:checked]:bg-[var(--brand-sky)]"
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...form.register("budget")}
                />
                {copy.budget[value]}
              </label>
            ))}
          </div>
          <FieldError message={form.formState.errors.budget?.message} />
        </fieldset>
      ) : null}

      {step === "contact" ? (
        <div className="space-y-5">
          <p className="text-sm leading-6 text-[var(--brand-ink)]/80">
            {copy.contactIntro}
          </p>
          <div>
            <label
              htmlFor="quiz-name"
              className="text-sm font-bold text-[var(--brand-navy)]"
            >
              {copy.nameLabel}
            </label>
            <input
              id="quiz-name"
              className={inputClass}
              autoComplete="name"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <label
              htmlFor="quiz-phone"
              className="text-sm font-bold text-[var(--brand-navy)]"
            >
              {copy.phoneLabel}
            </label>
            <input
              id="quiz-phone"
              className={inputClass}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(form.formState.errors.phone)}
              {...form.register("phone")}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {copy.phoneHint}
            </p>
            <FieldError message={form.formState.errors.phone?.message} />
          </div>
          <div>
            <label
              htmlFor="quiz-whatsapp"
              className="text-sm font-bold text-[var(--brand-navy)]"
            >
              {copy.whatsappLabel}
            </label>
            <input
              id="quiz-whatsapp"
              className={inputClass}
              type="tel"
              autoComplete="tel"
              {...form.register("whatsapp")}
            />
            <FieldError message={form.formState.errors.whatsapp?.message} />
          </div>
          <div>
            <label
              htmlFor="quiz-email"
              className="text-sm font-bold text-[var(--brand-navy)]"
            >
              {copy.emailLabel}
            </label>
            <input
              id="quiz-email"
              className={inputClass}
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div>
            <label className="flex items-start gap-3 text-sm leading-6 text-[var(--brand-ink)]">
              <input
                type="checkbox"
                className="focus-ring mt-1 size-4 rounded border-[var(--input)]"
                {...form.register("consent")}
              />
              <span>{copy.consentLabel}</span>
            </label>
            <FieldError message={form.formState.errors.consent?.message} />
          </div>
          <div>
            {siteKey ? (
              <TurnstileField
                siteKey={siteKey}
                onToken={(token) =>
                  form.setValue("turnstileToken", token, {
                    shouldValidate: true,
                  })
                }
                resetSignal={resetSignal}
              />
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">
                {copy.configError}
              </p>
            )}
            <FieldError
              message={form.formState.errors.turnstileToken?.message}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold text-slate-800 shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
            onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
          >
            {copy.back}
          </button>
        ) : null}
        {isLast ? (
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="btn-sunset focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {form.formState.isSubmitting ? copy.submitting : copy.submit}
          </button>
        ) : (
          <button
            type="button"
            className="btn-sunset focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
            onClick={async () => {
              const fields = fieldsForStep(step, destination);
              const valid = await form.trigger(fields);
              if (valid) {
                setStepIndex((value) => Math.min(STEPS.length - 1, value + 1));
              }
            }}
          >
            {copy.next}
          </button>
        )}
      </div>
    </form>
  );
}

function fieldsForStep(
  step: Step,
  destination: EligibilityDestination | undefined,
) {
  switch (step) {
    case "destination":
      return ["destination"] as const;
    case "education":
      return ["educationLevel"] as const;
    case "tests":
      return destination === "china"
        ? (["hsk", "ielts", "toefl"] as const)
        : destination === "south_korea"
          ? (["topik", "ielts", "toefl"] as const)
          : (["ielts", "toefl"] as const);
    case "budget":
      return ["budget"] as const;
    case "contact":
      return ["name", "phone", "consent", "turnstileToken"] as const;
  }
}

function EligibilityResultCard({
  copy,
  locale,
  result,
  footerNewTab,
}: {
  copy: EligibilityCopy;
  locale: Locale;
  result: EligibilityResult;
  footerNewTab: string;
}) {
  const summary = copy.results[result.destination][result.verdict];
  const whatsappHref = getWhatsAppHref(
    copy.whatsappResultMessage[result.destination],
  );

  return (
    <div className="space-y-6">
      <div className="eyebrow-pill inline-flex items-center gap-2">
        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
        <span>{copy.verdicts[result.verdict]}</span>
      </div>
      <h2 className="font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
        {summary.title}
      </h2>
      <p className="text-base leading-7 font-normal text-slate-600">
        {summary.body}
      </p>
      <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
        {result.reasons.map((reason) => (
          <li key={reason}>{copy.reasons[reason]}</li>
        ))}
      </ul>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="btn-sunset focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          {copy.ctaWhatsapp}
          <span className="sr-only">{footerNewTab}</span>
        </a>
        <Link
          href={localizedHref("/contact", locale)}
          className="btn-secondary-glass focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold text-slate-800 shadow-xs hover:border-orange-300 hover:bg-white hover:text-orange-600"
        >
          {copy.ctaContact}
        </Link>
      </div>
    </div>
  );
}

function ScoreSelect({
  id,
  label,
  hint,
  emptyLabel,
  options,
  error,
  field,
}: {
  id: string;
  label: string;
  hint: string;
  emptyLabel: string;
  options: readonly number[];
  error?: string;
  field: UseFormRegisterReturn;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-bold text-[var(--brand-navy)]"
      >
        {label}
      </label>
      <select
        id={id}
        className={inputClass}
        aria-invalid={Boolean(error)}
        {...field}
      >
        <option value="">{emptyLabel}</option>
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{hint}</p>
      <FieldError message={error} />
    </div>
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
