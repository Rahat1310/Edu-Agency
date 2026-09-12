"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type { ProgramActionState } from "@/app/admin/programs/actions";
import {
  programCountries,
  programLevels,
  tuitionCurrencies,
} from "@/db/schema";
import {
  defaultCurrencyByCountry,
  intakeMonthLabels,
  programCountryLabels,
  programLevelLabels,
  tuitionCurrencyLabels,
} from "@/lib/programs-labels";
import {
  programFormSchema,
  type ProgramFormValues,
} from "@/lib/schemas/program";
import { cn } from "@/lib/utils";

type ProgramFormProps = {
  defaultValues?: Partial<ProgramFormValues>;
  submitLabel: string;
  onSubmitAction: (values: ProgramFormValues) => Promise<ProgramActionState>;
};

const inputClass =
  "focus-ring mt-1.5 w-full rounded-xl border border-[var(--input)] bg-white px-3 py-2.5 text-sm text-[var(--brand-ink)]";

export function ProgramForm({
  defaultValues,
  submitLabel,
  onSubmitAction,
}: ProgramFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      universityName: "",
      country: "china",
      level: "bachelor",
      field: "",
      tuitionAmount: undefined,
      tuitionCurrency: "CNY",
      intakeMonths: [],
      requirements: "",
      scholarshipInfo: "",
      ...defaultValues,
    },
  });

  const selectedCountry = form.watch("country");
  const suggestedCurrency = useMemo(
    () => defaultCurrencyByCountry[selectedCountry],
    [selectedCountry],
  );

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
            form.setError(name as keyof ProgramFormValues, { message });
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="universityName"
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            University name
          </label>
          <input
            id="universityName"
            className={inputClass}
            autoComplete="organization"
            aria-invalid={Boolean(form.formState.errors.universityName)}
            {...form.register("universityName")}
          />
          <FieldError message={form.formState.errors.universityName?.message} />
        </div>

        <div>
          <label
            htmlFor="country"
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            Country
          </label>
          <select
            id="country"
            className={inputClass}
            aria-invalid={Boolean(form.formState.errors.country)}
            {...form.register("country", {
              onChange: (event) => {
                const country = event.target
                  .value as keyof typeof defaultCurrencyByCountry;
                if (country in defaultCurrencyByCountry) {
                  form.setValue(
                    "tuitionCurrency",
                    defaultCurrencyByCountry[country],
                    { shouldValidate: true },
                  );
                }
              },
            })}
          >
            {programCountries.map((country) => (
              <option key={country} value={country}>
                {programCountryLabels[country]}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.country?.message} />
        </div>

        <div>
          <label
            htmlFor="level"
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            Level
          </label>
          <select
            id="level"
            className={inputClass}
            aria-invalid={Boolean(form.formState.errors.level)}
            {...form.register("level")}
          >
            {programLevels.map((level) => (
              <option key={level} value={level}>
                {programLevelLabels[level]}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.level?.message} />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="field"
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            Field of study
          </label>
          <input
            id="field"
            className={inputClass}
            aria-invalid={Boolean(form.formState.errors.field)}
            {...form.register("field")}
          />
          <FieldError message={form.formState.errors.field?.message} />
        </div>

        <div>
          <label
            htmlFor="tuitionAmount"
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            Tuition amount
          </label>
          <input
            id="tuitionAmount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            className={inputClass}
            aria-invalid={Boolean(form.formState.errors.tuitionAmount)}
            {...form.register("tuitionAmount", { valueAsNumber: true })}
          />
          <FieldError message={form.formState.errors.tuitionAmount?.message} />
        </div>

        <div>
          <label
            htmlFor="tuitionCurrency"
            className="text-sm font-bold text-[var(--brand-navy)]"
          >
            Tuition currency
          </label>
          <p className="text-xs text-[var(--muted-foreground)]">
            Suggested for this country: {suggestedCurrency}
          </p>
          <select
            id="tuitionCurrency"
            className={inputClass}
            aria-invalid={Boolean(form.formState.errors.tuitionCurrency)}
            {...form.register("tuitionCurrency")}
          >
            {tuitionCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {tuitionCurrencyLabels[currency]}
              </option>
            ))}
          </select>
          <FieldError
            message={form.formState.errors.tuitionCurrency?.message}
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-bold text-[var(--brand-navy)]">
          Intake months
        </legend>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Optional. Leave empty if the intake is still being confirmed.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {intakeMonthLabels.map((month) => (
            <label
              key={month}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 text-sm"
            >
              <input
                type="checkbox"
                value={month}
                className="size-4 accent-[var(--brand-navy)]"
                {...form.register("intakeMonths")}
              />
              {month}
            </label>
          ))}
        </div>
        <FieldError message={form.formState.errors.intakeMonths?.message} />
      </fieldset>

      <div>
        <label
          htmlFor="requirements"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Requirements
        </label>
        <p className="text-xs text-[var(--muted-foreground)]">
          Optional. Language tests, GPA, or other notes.
        </p>
        <textarea
          id="requirements"
          rows={4}
          className={cn(inputClass, "min-h-28")}
          {...form.register("requirements")}
        />
        <FieldError message={form.formState.errors.requirements?.message} />
      </div>

      <div>
        <label
          htmlFor="scholarshipInfo"
          className="text-sm font-bold text-[var(--brand-navy)]"
        >
          Scholarship info
        </label>
        <p className="text-xs text-[var(--muted-foreground)]">Optional.</p>
        <textarea
          id="scholarshipInfo"
          rows={4}
          className={cn(inputClass, "min-h-28")}
          {...form.register("scholarshipInfo")}
        />
        <FieldError message={form.formState.errors.scholarshipInfo?.message} />
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
