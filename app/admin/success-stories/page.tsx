import Link from "next/link";

import { and, desc, eq, ilike, or } from "drizzle-orm";

import { SuccessStoryRowActions } from "@/components/admin/success-story-row-actions";
import { db } from "@/db";
import {
  programCountries,
  successStories,
  type ProgramCountry,
} from "@/db/schema";
import { programCountryLabels } from "@/lib/programs-labels";
import { successStoryListQuerySchema } from "@/lib/schemas/success-story";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, "").slice(0, 200)}%`;
}

function isProgramCountry(value: string): value is ProgramCountry {
  return programCountries.some((country) => country === value);
}

export default async function AdminSuccessStoriesPage({
  searchParams,
}: PageProps) {
  const raw = await searchParams;
  const parsed = successStoryListQuerySchema.safeParse({
    q: first(raw.q) ?? "",
    destination: first(raw.destination) ?? "",
    status: first(raw.status) ?? "all",
  });
  const query = parsed.success
    ? parsed.data
    : { q: "", destination: "", status: "all" as const };

  const filters = [];

  if (query.q) {
    const pattern = likePattern(query.q);
    filters.push(
      or(
        ilike(successStories.studentName, pattern),
        ilike(successStories.university, pattern),
        ilike(successStories.program, pattern),
      ),
    );
  }

  if (isProgramCountry(query.destination)) {
    filters.push(eq(successStories.destination, query.destination));
  }

  if (query.status === "published") {
    filters.push(eq(successStories.isPublished, true));
  }

  if (query.status === "draft") {
    filters.push(eq(successStories.isPublished, false));
  }

  const where = filters.length > 0 ? and(...filters) : undefined;

  const rows = await db
    .select()
    .from(successStories)
    .where(where)
    .orderBy(desc(successStories.createdAt));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-[var(--brand-navy)]">
            Success stories
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Drafts stay off the public listing and home featured set until you
            publish them. Photos use the public marketing bucket, not student
            document signed URLs.
          </p>
        </div>
        <Link
          href="/admin/success-stories/new"
          className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-blue)]"
        >
          New story
        </Link>
      </div>

      <form
        method="get"
        className="mt-8 grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
      >
        <label className="text-xs font-bold tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
          Search
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            placeholder="Name, university, or program"
            className="focus-ring mt-1.5 min-h-11 w-full rounded-xl border border-[var(--input)] px-3 text-sm font-normal text-[var(--brand-ink)] normal-case"
          />
        </label>
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

      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        {rows.length} stor{rows.length === 1 ? "y" : "ies"}
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--brand-sky)] text-xs tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">Destination</th>
              <th className="px-4 py-3 font-semibold">University</th>
              <th className="px-4 py-3 font-semibold">Program</th>
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
                  colSpan={6}
                  className="px-4 py-10 text-center text-[var(--muted-foreground)]"
                >
                  No stories match these filters.
                </td>
              </tr>
            ) : (
              rows.map((story) => (
                <tr key={story.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold text-[var(--brand-navy)]">
                    <Link
                      href={`/admin/success-stories/${story.id}/edit`}
                      className="focus-ring rounded-md hover:text-[var(--brand-blue)]"
                    >
                      {story.studentName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {programCountryLabels[story.destination]}
                  </td>
                  <td className="px-4 py-3">{story.university}</td>
                  <td className="px-4 py-3">{story.program}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        story.isPublished
                          ? "rounded-full bg-[var(--brand-green)]/12 px-2.5 py-1 text-xs font-bold text-[var(--brand-green)]"
                          : "rounded-full bg-[var(--brand-amber)]/16 px-2.5 py-1 text-xs font-bold text-[var(--brand-navy)]"
                      }
                    >
                      {story.isPublished ? "Published" : "Unpublished"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <SuccessStoryRowActions
                      id={story.id}
                      studentName={story.studentName}
                      isPublished={story.isPublished}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
