import Link from "next/link";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import { ProgramRowActions } from "@/components/admin/program-row-actions";
import { db } from "@/db";
import {
  programCountries,
  programLevels,
  programs,
  type ProgramCountry,
  type ProgramLevel,
} from "@/db/schema";
import {
  programCountryLabels,
  programLevelLabels,
} from "@/lib/programs-labels";
import { programListQuerySchema } from "@/lib/schemas/program";

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, "").slice(0, 200)}%`;
}

function isProgramCountry(value: string): value is ProgramCountry {
  return programCountries.some((country) => country === value);
}

function isProgramLevel(value: string): value is ProgramLevel {
  return programLevels.some((level) => level === value);
}

export default async function AdminProgramsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const parsed = programListQuerySchema.safeParse({
    q: first(raw.q) ?? "",
    country: first(raw.country) ?? "",
    level: first(raw.level) ?? "",
    status: first(raw.status) ?? "all",
    page: first(raw.page) ?? "1",
  });
  const query = parsed.success
    ? parsed.data
    : { q: "", country: "", level: "", status: "all" as const, page: 1 };

  const filters = [];

  if (query.q) {
    const pattern = likePattern(query.q);
    filters.push(
      or(
        ilike(programs.universityName, pattern),
        ilike(programs.field, pattern),
      ),
    );
  }

  if (isProgramCountry(query.country)) {
    filters.push(eq(programs.country, query.country));
  }

  if (isProgramLevel(query.level)) {
    filters.push(eq(programs.level, query.level));
  }

  if (query.status === "published") {
    filters.push(eq(programs.isPublished, true));
  }

  if (query.status === "draft") {
    filters.push(eq(programs.isPublished, false));
  }

  const where = filters.length > 0 ? and(...filters) : undefined;
  const offset = (query.page - 1) * PAGE_SIZE;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(programs)
      .where(where)
      .orderBy(desc(programs.updatedAt), desc(programs.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(programs)
      .where(where),
  ]);

  const total = countRows[0]?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.country) params.set("country", query.country);
    if (query.level) params.set("level", query.level);
    if (query.status !== "all") params.set("status", query.status);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/admin/programs?${qs}` : "/admin/programs";
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
            Programs
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Drafts stay off the public directory until you publish them.
          </p>
        </div>
        <Link
          href="/admin/programs/new"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-blue)]"
        >
          New program
        </Link>
      </div>

      <form
        method="get"
        className="mt-8 grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
      >
        <label className="text-xs font-bold tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
          Search
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            placeholder="University or field"
            className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-[var(--input)] px-3 text-sm font-normal text-[var(--brand-ink)] normal-case"
          />
        </label>
        <label className="text-xs font-bold tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
          Country
          <select
            name="country"
            defaultValue={query.country}
            className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-[var(--input)] px-3 text-sm font-normal text-[var(--brand-ink)] normal-case"
          >
            <option value="">All countries</option>
            {programCountries.map((country) => (
              <option key={country} value={country}>
                {programCountryLabels[country]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
          Level
          <select
            name="level"
            defaultValue={query.level}
            className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-[var(--input)] px-3 text-sm font-normal text-[var(--brand-ink)] normal-case"
          >
            <option value="">All levels</option>
            {programLevels.map((level) => (
              <option key={level} value={level}>
                {programLevelLabels[level]}
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

      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        {total} program{total === 1 ? "" : "s"}
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="min-w-[52rem] w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--brand-sky)] text-xs tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">University</th>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Level</th>
              <th className="px-4 py-3 font-semibold">Field</th>
              <th className="px-4 py-3 font-semibold">Tuition</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-[var(--muted-foreground)]"
                >
                  No programs match these filters.
                </td>
              </tr>
            ) : (
              rows.map((program) => (
                <tr
                  key={program.id}
                  className="border-t border-[var(--border)]"
                >
                  <td className="px-4 py-3 font-semibold text-[var(--brand-navy)]">
                    <Link
                      href={`/admin/programs/${program.id}/edit`}
                      className="focus-ring rounded-md hover:text-[var(--brand-blue)]"
                    >
                      {program.universityName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {programCountryLabels[program.country]}
                  </td>
                  <td className="px-4 py-3">
                    {programLevelLabels[program.level]}
                  </td>
                  <td className="px-4 py-3">{program.field}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {program.tuitionAmount} {program.tuitionCurrency}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        program.isPublished
                          ? "rounded-full bg-[var(--brand-green)]/12 px-2.5 py-1 text-xs font-bold text-[var(--brand-green)]"
                          : "rounded-full bg-[var(--brand-amber)]/16 px-2.5 py-1 text-xs font-bold text-[var(--brand-navy)]"
                      }
                    >
                      {program.isPublished ? "Published" : "Unpublished"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ProgramRowActions
                      id={program.id}
                      universityName={program.universityName}
                      isPublished={program.isPublished}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <nav
          className="mt-6 flex items-center justify-between gap-3"
          aria-label="Pagination"
        >
          {query.page > 1 ? (
            <Link
              href={hrefFor(query.page - 1)}
              className="focus-ring inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-white px-4 text-sm font-bold"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <p className="text-sm text-[var(--muted-foreground)]">
            Page {query.page} of {pageCount}
          </p>
          {query.page < pageCount ? (
            <Link
              href={hrefFor(query.page + 1)}
              className="focus-ring inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-white px-4 text-sm font-bold"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
