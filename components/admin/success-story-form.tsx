"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { SuccessStoryActionState } from "@/app/admin/success-stories/actions";
import { programCountries } from "@/db/schema";
import { programCountryLabels } from "@/lib/programs-labels";
import {
  successStoryFormSchema,
  type SuccessStoryFormValues,
} from "@/lib/schemas/success-story";

type SuccessStoryFormProps = {
  defaultValues?: Partial<{
    studentName: string;
    destination: SuccessStoryFormValues["destination"];
    university: string;
    program: string;
    quote: string;
    photoR2Key: string;
  }>;
  submitLabel: string;
  onSubmitAction: (
    values: SuccessStoryFormValues,
  ) => Promise<SuccessStoryActionState>;
};

const inputClass =
  "focus-ring mt-1.5 w-full rounded-xl border border-[var(--input)] bg-white px-3 py-2.5 text-sm text-[var(--brand-ink)]";

export function SuccessStoryForm({
  defaultValues,
  submitLabel,
  onSubmitAction,
}: SuccessStoryFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SuccessStoryFormValues>({
    resolver: zodResolver(successStoryFormSchema),
    defaultValues: {
      studentName: defaultValues?.studentName ?? "",
      destination: defaultValues?.destination ?? "china",
      university: defaultValues?.university ?? "",
      program: defaultValues?.program ?? "",
      quote: defaultValues?.quote ?? "",
      photoR2Key: defaultValues?.photoR2Key ?? "",
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
            form.setError(name as keyof SuccessStoryFormValues, { message });
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
          htmlFor="studentName"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Student name
        </label>
        <input
          id="studentName"
          className={inputClass}
          aria-invalid={Boolean(form.formState.errors.studentName)}
          {...form.register("studentName")}
        />
        <FieldError message={form.formState.errors.studentName?.message} />
      </div>

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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="university"
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            University
          </label>
          <input
            id="university"
            className={inputClass}
            aria-invalid={Boolean(form.formState.errors.university)}
            {...form.register("university")}
          />
          <FieldError message={form.formState.errors.university?.message} />
        </div>
        <div>
          <label
            htmlFor="program"
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            Program
          </label>
          <input
            id="program"
            className={inputClass}
            aria-invalid={Boolean(form.formState.errors.program)}
            {...form.register("program")}
          />
          <FieldError message={form.formState.errors.program?.message} />
        </div>
      </div>

      <div>
        <label
          htmlFor="quote"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Quote
        </label>
        <textarea
          id="quote"
          rows={5}
          className={`${inputClass} min-h-32`}
          aria-invalid={Boolean(form.formState.errors.quote)}
          {...form.register("quote")}
        />
        <FieldError message={form.formState.errors.quote?.message} />
      </div>

      <div>
        <label
          htmlFor="photoR2Key"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Photo object key
        </label>
        <p className="text-xs text-[var(--muted-foreground)]">
          Optional. Public marketing bucket only (e.g.{" "}
          <span className="font-mono">success-stories/name.jpg</span>
          ). Do not paste a private student-document key or a signed URL. Set{" "}
          <span className="font-mono">R2_PUBLIC_BASE_URL</span> so the public
          site can render it.
        </p>
        <input
          id="photoR2Key"
          className={inputClass}
          placeholder="success-stories/ayesha.jpg"
          aria-invalid={Boolean(form.formState.errors.photoR2Key)}
          {...form.register("photoR2Key")}
        />
        <FieldError message={form.formState.errors.photoR2Key?.message} />
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
