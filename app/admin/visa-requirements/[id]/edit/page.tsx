import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { updateVisaRequirement } from "@/app/admin/visa-requirements/actions";
import { VisaRequirementForm } from "@/components/admin/visa-requirement-form";
import { db } from "@/db";
import { visaRequirements } from "@/db/schema";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditVisaRequirementPage({ params }: PageProps) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(visaRequirements)
    .where(eq(visaRequirements.id, id))
    .limit(1);

  if (!row) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <p className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        Edit requirement
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
        {row.documentName}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Publishing is controlled from the list, not this form. Unpublished rows
        stay off the student checklist.
      </p>
      <p className="mt-4">
        <Link
          href="/admin/visa-requirements"
          className="focus-ring rounded-md text-sm font-bold text-[var(--brand-blue)]"
        >
          Back to visa requirements
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-8">
        <VisaRequirementForm
          defaultValues={{
            destination: row.destination,
            documentName: row.documentName,
            documentTypeKey: row.documentTypeKey,
            description: row.description ?? "",
            notes: row.notes ?? "",
            sortOrder: row.sortOrder,
          }}
          submitLabel="Save changes"
          onSubmitAction={updateVisaRequirement.bind(null, row.id)}
        />
      </div>
    </div>
  );
}
