"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { submitPortalPhone } from "@/app/portal/actions";
import {
  portalPhoneSchema,
  type PortalPhoneValues,
} from "@/lib/schemas/portal";

const inputClass =
  "desk-focus mt-1.5 w-full rounded-xl border border-[var(--desk-line)] bg-white px-3 py-2.5 text-sm text-[var(--desk-ink)]";

export function PhoneOnboarding() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<PortalPhoneValues>({
    resolver: zodResolver(portalPhoneSchema),
    defaultValues: { phone: "" },
  });

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-5 py-6">
      <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-[var(--desk-accent)]">
        What number can we reach you on?
      </h1>
      <p
        id="portal-phone-hint"
        className="mt-2 text-sm leading-6 text-[var(--desk-ink-muted)]"
      >
        Use the same phone you gave us on WhatsApp or the website, so we can
        find the inquiry you already sent. Include the country code, for example
        +880 1XXX-XXXXXX.
      </p>
      <form
        className="mt-5"
        aria-busy={pending}
        onSubmit={form.handleSubmit((values) => {
          setFormError(null);
          startTransition(async () => {
            const result = await submitPortalPhone(values);
            if (!result.ok) {
              setFormError(result.message);
              return;
            }
            router.refresh();
          });
        })}
      >
        <label
          htmlFor="portal-phone"
          className="text-sm font-semibold text-[var(--desk-accent)]"
        >
          Phone
        </label>
        <input
          id="portal-phone"
          type="tel"
          autoComplete="tel"
          className={inputClass}
          aria-invalid={Boolean(form.formState.errors.phone)}
          aria-describedby={
            form.formState.errors.phone
              ? "portal-phone-error portal-phone-hint"
              : "portal-phone-hint"
          }
          {...form.register("phone")}
        />
        {form.formState.errors.phone?.message ? (
          <p
            id="portal-phone-error"
            className="mt-1.5 text-sm text-[var(--destructive)]"
            role="alert"
          >
            {form.formState.errors.phone.message}
          </p>
        ) : null}
        {formError ? (
          <p className="mt-3 text-sm text-[var(--destructive)]" role="alert">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="desk-focus mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Looking up your file…" : "Find my file"}
        </button>
      </form>
    </div>
  );
}
