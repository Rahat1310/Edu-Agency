import Link from "next/link";

import { createProgram } from "@/app/admin/programs/actions";
import { ProgramForm } from "@/components/admin/program-form";

export default async function NewProgramPage() {
  return (
    <div className="max-w-3xl">
      <p className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        New program
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
        Add a program
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Saved as unpublished. Use the list toggle when it is ready to appear
        on the public site.
      </p>
      <p className="mt-4">
        <Link
          href="/admin/programs"
          className="focus-ring rounded-md text-sm font-bold text-[var(--brand-blue)]"
        >
          Back to programs
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-8">
        <ProgramForm submitLabel="Create program" onSubmitAction={createProgram} />
      </div>
    </div>
  );
}
