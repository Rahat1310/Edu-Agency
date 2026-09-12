"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { IntakeDeadlineActionState } from "@/app/admin/intake-deadlines/actions";
import { programCountries } from "@/db/schema";
import { programCountryLabels } from "@/lib/programs-labels";
import {
  intakeDeadlineFormSchema,
  type IntakeDeadlineFormValues,
} from "@/lib/schemas/intake-deadline";

type IntakeDeadlineFormProps = {
  defaultValues?: Partial<IntakeDeadlineFormValues>;
  submitLabel: string;
  onSubmitAction: (
    values: IntakeDeadlineFormValues,
  ) => Promise<IntakeDeadlineActionState>;
};

const inputClass =
  "focus-ring mt-1.5 w-full rounded-xl border border-[var(--input)] bg-white px-3 py-2.5 text-sm text-[var(--brand-ink)]";

export function IntakeDeadlineForm({
  defaultValues,
  submitLabel,
  onSubmitAction,
}: IntakeDeadlineFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<IntakeDeadlineFormValues>({
    resolver: zodResolver(intakeDeadlineFormSchema),
    defaultValues: {
      destination: defaultValues?.destination ?? "china",
      intakeLabel: defaultValues?.intakeLabel ?? "",
      applicationDeadline: defaultValues?.applicationDeadline ?? "",
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(async (values) => {
        setFormError(null);
        const result = await onSubmitAction(values);

        if (result.fields) {
          for (const [name, messages] of Object.entries(result.fields)) {
            const message = messages[0];
            if (!message) {
              continue;
            }
            form.setError(name as keyof IntakeDeadlineFormValues, {
              message,
            });
          }
        }

        if (result.error) {
          setFormError(result.error);
        }
      })}
      noValidate
    >
      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/8 px-4 py-3 text-sm text-[var(--destructive)]"
        >
          {formError}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="destination"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Destination
        </label>
        <select
          id="destination"
          className={inputClass}
          aria-invalid={Boolean(form.formState.errors.destination)}
          {...form.register("destination")}
        >
          {programCountries.map((country) => (
            <option key={country} value={country}>
              {programCountryLabels[country]}
            </option>
          ))}
        </select>
        <FieldError message={form.formState.errors.destination?.message} />
      </div>

      <div>
        <label
          htmlFor="intakeLabel"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Intake label
        </label>
        <p className="text-xs text-[var(--muted-foreground)]">
          Shown on the public site, e.g. Spring 2027.
        </p>
        <input
          id="intakeLabel"
          className={inputClass}
          placeholder="Spring 2027"
          aria-invalid={Boolean(form.formState.errors.intakeLabel)}
          {...form.register("intakeLabel")}
        />
        <FieldError message={form.formState.errors.intakeLabel?.message} />
      </div>

      <div>
        <label
          htmlFor="applicationDeadline"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Application deadline
        </label>
        <p className="text-xs text-[var(--muted-foreground)]">
          Calendar date in Dhaka. Once this day has passed, the next upcoming
          intake is shown instead.
        </p>
        <input
          id="applicationDeadline"
          type="date"
          className={inputClass}
          aria-invalid={Boolean(form.formState.errors.applicationDeadline)}
          {...form.register("applicationDeadline")}
        />
        <FieldError
          message={form.formState.errors.applicationDeadline?.message}
        />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-navy)] px-6 text-sm font-bold text-white hover:bg-[var(--brand-blue)] disabled:opacity-60"
      >
        {form.formState.isSubmitting ? "Saving…" : submitLabel}
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
