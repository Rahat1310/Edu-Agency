"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { VisaRequirementActionState } from "@/app/admin/visa-requirements/actions";
import { programCountries } from "@/db/schema";
import { programCountryLabels } from "@/lib/programs-labels";
import {
  visaRequirementFormSchema,
  type VisaRequirementFormValues,
} from "@/lib/schemas/visa-requirement";

type VisaRequirementFormProps = {
  defaultValues?: Partial<VisaRequirementFormValues>;
  submitLabel: string;
  onSubmitAction: (
    values: VisaRequirementFormValues,
  ) => Promise<VisaRequirementActionState>;
};

const inputClass =
  "focus-ring mt-1.5 w-full rounded-xl border border-[var(--input)] bg-white px-3 py-2.5 text-sm text-[var(--brand-ink)]";

export function VisaRequirementForm({
  defaultValues,
  submitLabel,
  onSubmitAction,
}: VisaRequirementFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(visaRequirementFormSchema),
    defaultValues: {
      destination: defaultValues?.destination ?? "china",
      documentName: defaultValues?.documentName ?? "",
      documentTypeKey: defaultValues?.documentTypeKey ?? "",
      description: defaultValues?.description ?? "",
      notes: defaultValues?.notes ?? "",
      sortOrder: defaultValues?.sortOrder ?? 0,
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
            form.setError(name as keyof VisaRequirementFormValues, {
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
          htmlFor="documentName"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Document name
        </label>
        <input
          id="documentName"
          className={inputClass}
          aria-invalid={Boolean(form.formState.errors.documentName)}
          {...form.register("documentName")}
        />
        <FieldError message={form.formState.errors.documentName?.message} />
      </div>

      <div>
        <label
          htmlFor="documentTypeKey"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Document type key
        </label>
        <input
          id="documentTypeKey"
          className={inputClass}
          spellCheck={false}
          aria-invalid={Boolean(form.formState.errors.documentTypeKey)}
          {...form.register("documentTypeKey")}
        />
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
          Matches a student upload in the checklist — e.g. jw201_jw202,
          emgs_approval, sii_registration. Lowercase letters, numbers, and
          underscores only.
        </p>
        <FieldError message={form.formState.errors.documentTypeKey?.message} />
      </div>

      <div>
        <label
          htmlFor="description"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className={inputClass}
          {...form.register("description")}
        />
        <FieldError message={form.formState.errors.description?.message} />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Internal notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className={inputClass}
          {...form.register("notes")}
        />
        <FieldError message={form.formState.errors.notes?.message} />
      </div>

      <div>
        <label
          htmlFor="sortOrder"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Sort order
        </label>
        <input
          id="sortOrder"
          type="number"
          min={0}
          max={9999}
          className={inputClass}
          aria-invalid={Boolean(form.formState.errors.sortOrder)}
          {...form.register("sortOrder", { valueAsNumber: true })}
        />
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
          Lower numbers show first in the student checklist. You can also
          reorder from the list.
        </p>
        <FieldError message={form.formState.errors.sortOrder?.message} />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="focus-ring inline-flex min-h-11 items-center rounded-full bg-[var(--brand-navy)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-blue)] disabled:opacity-60"
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
