"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  ChevronDown,
  Compass,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
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

const inputWithIconClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,122,0,0.12)] focus:outline-none";

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
      <div className={cn("space-y-4 py-4 text-center", className)}>
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-xs">
          <Sparkles className="size-7" />
        </div>
        {heading ? (
          <Title
            className={cn(
              "font-display font-bold tracking-tight text-slate-900",
              compact ? "text-lg" : "text-2xl",
            )}
          >
            {heading}
          </Title>
        ) : null}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-sm leading-relaxed text-emerald-900 shadow-2xs">
          <p className="font-bold text-emerald-950">Thank you! Your submission was received.</p>
          <p className="mt-1 text-emerald-800">{copy.success}</p>
        </div>
      </div>
    );
  }

  return (
    <form
      className={cn("relative", compact ? "space-y-3.5" : "space-y-4.5", className)}
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
            "font-display font-bold tracking-tight text-slate-900",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {heading}
        </Title>
      ) : null}
      {intro ? (
        <p
          className={cn(
            "text-slate-600",
            compact ? "text-sm leading-6" : "text-base leading-7",
          )}
        >
          {intro}
        </p>
      ) : null}

      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 shadow-2xs"
        >
          {formError}
        </div>
      ) : null}

      {/* Honeypot anti-spam field */}
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

      {/* 1. Name Field */}
      <div>
        <label
          htmlFor={`${fieldId}-name`}
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          {copy.nameLabel} <span className="text-rose-500">*</span>
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <User className="size-4" />
          </span>
          <input
            id={`${fieldId}-name`}
            className={inputWithIconClass}
            placeholder="e.g. Tanvir Ahmed"
            autoComplete="name"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
        </div>
        <FieldError message={form.formState.errors.name?.message} />
      </div>

      {/* 2. Phone & WhatsApp Row */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${fieldId}-phone`}
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            {copy.phoneLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Phone className="size-4" />
            </span>
            <input
              id={`${fieldId}-phone`}
              className={inputWithIconClass}
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(form.formState.errors.phone)}
              {...form.register("phone")}
            />
          </div>
          <FieldError message={form.formState.errors.phone?.message} />
        </div>

        <div>
          <label
            htmlFor={`${fieldId}-whatsapp`}
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            {copy.whatsappLabel}
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-500">
              <MessageCircle className="size-4" />
            </span>
            <input
              id={`${fieldId}-whatsapp`}
              className={inputWithIconClass}
              type="tel"
              placeholder="WhatsApp number"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(form.formState.errors.whatsapp)}
              {...form.register("whatsapp")}
            />
          </div>
          <FieldError message={form.formState.errors.whatsapp?.message} />
        </div>
      </div>

      {/* 3. Email Field */}
      <div>
        <label
          htmlFor={`${fieldId}-email`}
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          {copy.emailLabel}
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Mail className="size-4" />
          </span>
          <input
            id={`${fieldId}-email`}
            className={inputWithIconClass}
            type="email"
            placeholder="student@example.com"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </div>
        <FieldError message={form.formState.errors.email?.message} />
      </div>

      {/* 4. Destination of Interest */}
      <div>
        <label
          htmlFor={`${fieldId}-destination`}
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          {copy.destinationLabel} <span className="text-rose-500">*</span>
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Compass className="size-4" />
          </span>
          <select
            id={`${fieldId}-destination`}
            className={cn(inputWithIconClass, "appearance-none pr-10 cursor-pointer")}
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
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <ChevronDown className="size-4" />
          </span>
        </div>
        <FieldError
          message={form.formState.errors.destinationInterest?.message}
        />
      </div>

      {/* 5. Message Field */}
      <div>
        <label
          htmlFor={`${fieldId}-message`}
          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
        >
          {copy.messageLabel}
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute top-3 left-3.5 text-slate-400">
            <MessageSquare className="size-4" />
          </span>
          <textarea
            id={`${fieldId}-message`}
            rows={compact ? 2 : 3}
            className={cn(
              "w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-2xs transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,122,0,0.12)] focus:outline-none min-h-[85px]"
            )}
            placeholder={copy.messagePlaceholder}
            aria-invalid={Boolean(form.formState.errors.message)}
            {...form.register("message")}
          />
        </div>
        <FieldError message={form.formState.errors.message?.message} />
      </div>

      {/* 6. Consent Checkbox */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
        <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500/20 cursor-pointer accent-orange-600 shrink-0"
            aria-invalid={Boolean(form.formState.errors.consent)}
            {...form.register("consent")}
          />
          <span>{copy.consentLabel}</span>
        </label>
        <FieldError message={form.formState.errors.consent?.message} />
      </div>

      {/* 7. Turnstile (rendered cleanly only when key is configured) */}
      {siteKey ? (
        <div>
          <TurnstileField
            siteKey={siteKey}
            onToken={(token) =>
              form.setValue("turnstileToken", token, { shouldValidate: true })
            }
            resetSignal={resetSignal}
          />
          <FieldError message={form.formState.errors.turnstileToken?.message} />
        </div>
      ) : null}

      {/* 8. Full-Width CTA Button & Trust Seal */}
      <div className="space-y-2.5 pt-1">
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className={cn(
            "btn-sunset focus-ring group w-full min-h-12.5 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-orange-500/30 active:scale-[0.99] transition-all disabled:opacity-60 flex",
          )}
        >
          <Sparkles className="size-4 text-amber-200" />
          <span>{form.formState.isSubmitting ? copy.submitting : copy.submit}</span>
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-center text-[0.72rem] text-slate-500">
          <Lock className="size-3 text-slate-400" />
          <span>100% Confidential · Direct WhatsApp Delivery · Zero Spam</span>
        </div>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-semibold text-rose-600" role="alert">
      {message}
    </p>
  );
}
