import Link from "next/link";

import { createVisaRequirement } from "@/app/admin/visa-requirements/actions";
import { VisaRequirementForm } from "@/components/admin/visa-requirement-form";

export default async function NewVisaRequirementPage() {
  return (
    <div className="max-w-3xl">
      <p className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        New requirement
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
        Add a visa requirement
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Saved as unpublished. Use the list toggle when it should appear on the
        student checklist.
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
          submitLabel="Create requirement"
          onSubmitAction={createVisaRequirement}
        />
      </div>
    </div>
  );
}
