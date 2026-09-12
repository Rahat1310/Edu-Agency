import Link from "next/link";

import { and, asc, eq } from "drizzle-orm";

import { VisaRequirementsList } from "@/components/admin/visa-requirements-list";
import { db } from "@/db";
import {
  programCountries,
  visaRequirements,
  type ProgramCountry,
  type VisaRequirement,
} from "@/db/schema";
import { programCountryLabels } from "@/lib/programs-labels";
import { visaRequirementListQuerySchema } from "@/lib/schemas/visa-requirement";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isProgramCountry(value: string): value is ProgramCountry {
  return programCountries.some((country) => country === value);
}

export default async function AdminVisaRequirementsPage({
  searchParams,
}: PageProps) {
  const raw = await searchParams;
  const parsed = visaRequirementListQuerySchema.safeParse({
    destination: first(raw.destination) ?? "",
    status: first(raw.status) ?? "all",
  });
  const query = parsed.success
    ? parsed.data
    : { destination: "", status: "all" as const };

  const filters = [];

  if (isProgramCountry(query.destination)) {
    filters.push(eq(visaRequirements.destination, query.destination));
  }

  if (query.status === "published") {
    filters.push(eq(visaRequirements.isPublished, true));
  }

  if (query.status === "draft") {
    filters.push(eq(visaRequirements.isPublished, false));
  }

  const where = filters.length > 0 ? and(...filters) : undefined;

  let rows: VisaRequirement[] = [];
  let loadError = false;

  try {
    rows = await db
      .select()
      .from(visaRequirements)
      .where(where)
      .orderBy(
        asc(visaRequirements.destination),
        asc(visaRequirements.sortOrder),
        asc(visaRequirements.documentName),
      );
  } catch {
    loadError = true;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
            Visa requirements
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
            Destination checklists for China, India, Malaysia, and South Korea.
            Unpublished rows never appear on the student document checklist.
            Placeholder names stay until destination research replaces them.
          </p>
        </div>
        <Link
          href="/admin/visa-requirements/new"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-blue)]"
        >
          New requirement
        </Link>
      </div>

      <form
        method="get"
        className="mt-8 grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]"
      >
        <label className="text-xs font-bold tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
          Destination
          <select
            name="destination"
            defaultValue={query.destination}
            className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-[var(--input)] px-3 text-sm font-normal text-[var(--brand-ink)] normal-case"
          >
            <option value="">All destinations</option>
            {programCountries.map((country) => (
              <option key={country} value={country}>
                {programCountryLabels[country]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
          Status
          <select
            name="status"
            defaultValue={query.status}
            className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-[var(--input)] px-3 text-sm font-normal text-[var(--brand-ink)] normal-case"
          >
            <option value="all">All</option>
            <option value="draft">Unpublished</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button
          type="submit"
          className="focus-ring mt-auto inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-navy)] px-4 text-sm font-bold text-white"
        >
          Filter
        </button>
      </form>

      <VisaRequirementsList
        loadError={loadError}
        rows={rows.map((row, index) => {
          const previous = rows[index - 1];
          const next = rows[index + 1];

          return {
            id: row.id,
            destination: row.destination,
            documentName: row.documentName,
            documentTypeKey: row.documentTypeKey,
            sortOrder: row.sortOrder,
            isPublished: row.isPublished,
            canMoveUp: previous?.destination === row.destination,
            canMoveDown: next?.destination === row.destination,
          };
        })}
      />
    </div>
  );
}
