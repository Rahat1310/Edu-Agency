import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { updateProgram } from "@/app/admin/programs/actions";
import { ProgramForm } from "@/components/admin/program-form";
import { db } from "@/db";
import { programs } from "@/db/schema";
import { intakeMonths, type ProgramFormValues } from "@/lib/schemas/program";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProgramPage({ params }: PageProps) {
  const { id } = await params;
  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.id, id))
    .limit(1);

  if (!program) {
    notFound();
  }

  const intake = (program.intakeMonths ?? []).filter(
    (month): month is (typeof intakeMonths)[number] =>
      intakeMonths.some((item) => item === month),
  );

  const defaultValues: Partial<ProgramFormValues> = {
    universityName: program.universityName,
    country: program.country,
    level: program.level,
    field: program.field,
    tuitionAmount: Number(program.tuitionAmount),
    tuitionCurrency: program.tuitionCurrency,
    intakeMonths: intake,
    requirements: program.requirements ?? "",
    scholarshipInfo: program.scholarshipInfo ?? "",
  };

  return (
    <div className="max-w-3xl">
      <p className="font-utility text-[0.68rem] tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
        Edit program
      </p>
      <h1 className="font-display mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
        {program.universityName}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Publishing is controlled from the programs list, not this form.
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
        <ProgramForm
          defaultValues={defaultValues}
          submitLabel="Save changes"
          onSubmitAction={updateProgram.bind(null, program.id)}
        />
      </div>
    </div>
  );
}
