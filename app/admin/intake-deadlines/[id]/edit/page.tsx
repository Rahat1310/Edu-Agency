import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { updateIntakeDeadline } from "@/app/admin/intake-deadlines/actions";
import { IntakeDeadlineForm } from "@/components/admin/intake-deadline-form";
import { db } from "@/db";
import { intakeDeadlines } from "@/db/schema";
import type { IntakeDeadlineFormValues } from "@/lib/schemas/intake-deadline";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditIntakeDeadlinePage({ params }: PageProps) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(intakeDeadlines)
    .where(eq(intakeDeadlines.id, id))
    .limit(1);

  if (!row) {
    notFound();
  }

  const defaultValues: Partial<IntakeDeadlineFormValues> = {
    destination: row.destination,
    intakeLabel: row.intakeLabel,
    applicationDeadline: row.applicationDeadline,
  };

  return (
    <div className="max-w-3xl">
      <p className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        Edit deadline
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
        {row.intakeLabel}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Saving refreshes the public countdown on home and destination pages.
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
          defaultValues={defaultValues}
          submitLabel="Save changes"
          onSubmitAction={updateIntakeDeadline.bind(null, row.id)}
        />
      </div>
    </div>
  );
}
