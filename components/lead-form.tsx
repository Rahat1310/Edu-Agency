"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

import { TurnstileField } from "@/components/turnstile-field";
import type { LeadSubmitResult } from "@/lib/leads/types";
import type { Dictionary } from "@/lib/i18n/types";
import {
  HONEYPOT_FIELD,
  leadClientSchema,
  leadDestinationInterestValues,
} from "@/lib/schemas/lead";
import { cn } from "@/lib/utils";

export type LeadFormCopy = Dictionary["leadForm"];

type LeadFormProps = {
  copy: LeadFormCopy;
  source?: string;
  heading?: string;
  intro?: string;
  defaultMessage?: string;
  compact?: boolean;
  className?: string;
};

const inputClass =
  "focus-ring mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-2xs transition-all placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,122,0,0.15)]";

export function LeadForm({
  copy,
  source = "website",
  heading,
  intro,
  defaultMessage,
  compact = false,
  className,
}: LeadFormProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const fieldId = useId();
  const [formError, setFormError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const Title = compact ? "h3" : "h2";

  const form = useForm({
    resolver: zodResolver(leadClientSchema),
    defaultValues: {
      name: "",
      phone: "",
      whatsapp: "",
      email: "",
      destinationInterest: undefined,
      message: defaultMessage ?? "",
      consent: false,
      turnstileToken: "",
      [HONEYPOT_FIELD]: "",
    },
  });

  if (succeeded) {
    return (
      <div className={cn("space-y-3", className)}>
        {heading ? (
          <Title
            className={cn(
              "font-display font-bold tracking-[-0.03em] text-[var(--brand-navy)]",
              compact ? "text-lg" : "text-2xl",
            )}
          >
            {heading}
          </Title>
        ) : null}
        <p
          role="status"
          className="rounded-xl border border-[var(--brand-green)]/30 bg-[var(--brand-green)]/8 px-4 py-3 text-sm leading-6 text-[var(--brand-navy)]"
        >
          {copy.success}
        </p>
      </div>
    );
  }

  return (
    <form
      className={cn("relative", compact ? "space-y-3" : "space-y-5", className)}
      onSubmit={form.handleSubmit(async (values) => {
        setFormError(null);

        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            phone: values.phone,
            whatsapp: values.whatsapp,
            email: values.email,
            destinationInterest: values.destinationInterest,
            message: values.message,
            consent: values.consent,
            turnstileToken: values.turnstileToken,
            source,
            [HONEYPOT_FIELD]: values[HONEYPOT_FIELD],
          }),
        });

        let result: LeadSubmitResult;
        try {
          result = (await response.json()) as LeadSubmitResult;
        } catch {
          setFormError(copy.genericError);
          setResetSignal((value) => value + 1);
          return;
        }

        if (result.ok) {
          setSucceeded(true);
          return;
        }

        if (result.fields) {
          for (const [name, messages] of Object.entries(result.fields)) {
            const message = messages[0];
            if (!message) {
              continue;
            }
            form.setError(name as keyof typeof values, { message });
          }
        }

        if (result.code === "turnstile") {
          setFormError(copy.turnstileError);
        } else if (result.code === "rate_limit") {
          setFormError(copy.rateLimitError);
        } else if (result.code === "config") {
          setFormError(copy.configError);
        } else if (result.code === "validation") {
          setFormError(null);
        } else {
          setFormError(result.message || copy.genericError);
        }

        setResetSignal((value) => value + 1);
      })}
      noValidate
    >
      {heading ? (
        <Title
          className={cn(
            "font-display font-bold tracking-[-0.03em] text-[var(--brand-navy)]",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {heading}
        </Title>
      ) : null}
      {intro ? (
        <p
          className={cn(
            "text-[var(--brand-ink)]/80",
            compact ? "text-sm leading-6" : "text-base leading-7",
          )}
        >
          {intro}
        </p>
      ) : null}

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
        <label htmlFor={`${fieldId}-honeypot`}>{copy.honeypotLabel}</label>
        <input
          id={`${fieldId}-honeypot`}
          tabIndex={-1}
          autoComplete="off"
          {...form.register(HONEYPOT_FIELD)}
        />
      </div>

      <div>
        <label
          htmlFor={`${fieldId}-name`}
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          {copy.nameLabel}
        </label>
        <input
          id={`${fieldId}-name`}
          className={inputClass}
          autoComplete="name"
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register("name")}
        />
        <FieldError message={form.formState.errors.name?.message} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${fieldId}-phone`}
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            {copy.phoneLabel}
          </label>
          <input
            id={`${fieldId}-phone`}
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
            htmlFor={`${fieldId}-whatsapp`}
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            {copy.whatsappLabel}
          </label>
          <input
            id={`${fieldId}-whatsapp`}
            className={inputClass}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(form.formState.errors.whatsapp)}
            {...form.register("whatsapp")}
          />
          <FieldError message={form.formState.errors.whatsapp?.message} />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${fieldId}-email`}
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          {copy.emailLabel}
        </label>
        <input
          id={`${fieldId}-email`}
          className={inputClass}
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        <FieldError message={form.formState.errors.email?.message} />
      </div>

      <div>
        <label
          htmlFor={`${fieldId}-destination`}
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          {copy.destinationLabel}
        </label>
        <select
          id={`${fieldId}-destination`}
          className={inputClass}
          aria-invalid={Boolean(form.formState.errors.destinationInterest)}
          {...form.register("destinationInterest")}
        >
          <option value="">{copy.destinationPlaceholder}</option>
          {leadDestinationInterestValues.map((value) => (
            <option key={value} value={value}>
              {copy.destinations[value]}
            </option>
          ))}
        </select>
        <FieldError
          message={form.formState.errors.destinationInterest?.message}
        />
      </div>

      <div>
        <label
          htmlFor={`${fieldId}-message`}
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          {copy.messageLabel}
        </label>
        <textarea
          id={`${fieldId}-message`}
          rows={compact ? 3 : 4}
          className={cn(inputClass, "min-h-28")}
          placeholder={copy.messagePlaceholder}
          aria-invalid={Boolean(form.formState.errors.message)}
          {...form.register("message")}
        />
        <FieldError message={form.formState.errors.message?.message} />
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm leading-6 text-[var(--brand-ink)]">
          <input
            type="checkbox"
            className="focus-ring mt-1 size-4 rounded border-[var(--input)]"
            aria-invalid={Boolean(form.formState.errors.consent)}
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
              form.setValue("turnstileToken", token, { shouldValidate: true })
            }
            resetSignal={resetSignal}
          />
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            {copy.configError}
          </p>
        )}
        <FieldError message={form.formState.errors.turnstileToken?.message} />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className={cn(
          "btn-sunset focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-7 text-sm font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60",
          compact && "w-full",
        )}
      >
        {form.formState.isSubmitting ? copy.submitting : copy.submit}
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
