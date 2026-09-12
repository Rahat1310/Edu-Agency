import Link from "next/link";

import { createIntakeDeadline } from "@/app/admin/intake-deadlines/actions";
import { IntakeDeadlineForm } from "@/components/admin/intake-deadline-form";

export default async function NewIntakeDeadlinePage() {
  return (
    <div className="max-w-3xl">
      <p className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        New deadline
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
        Add an intake deadline
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        These dates drive the public countdown. Use a placeholder until the
        destination research pass confirms the official window.
      </p>
      <p className="mt-4">
        <Link
          href="/admin/intake-deadlines"
          className="focus-ring rounded-md text-sm font-bold text-[var(--brand-blue)]"
        >
          Back to intake deadlines
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-8">
        <IntakeDeadlineForm
          submitLabel="Create deadline"
          onSubmitAction={createIntakeDeadline}
        />
      </div>
    </div>
  );
}
