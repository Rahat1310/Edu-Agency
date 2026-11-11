import Link from "next/link";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import { listApplicationCases } from "@/lib/applications/load";
import { formStatuses, formStatusLabels } from "@/lib/applications/schema";
import { formatLeadDate, leadStatusLabels } from "@/lib/leads/labels";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDashboardAccess();
  const raw = await searchParams;
  const first = (key: string) =>
    typeof raw[key] === "string" ? (raw[key] as string) : "";
  const filters = {
    q: first("q"),
    status: first("status"),
    lead: first("lead"),
    page: first("page"),
  };
  const list = await listApplicationCases(filters);
  const href = (page: number) => {
    const query = new URLSearchParams({ ...filters, page: String(page) });
    return `/admin/applications?${query}`;
  };
  const input =
    "desk-focus mt-1 min-h-11 w-full rounded-xl border border-[var(--desk-line)] bg-[var(--desk-surface)] px-3 text-sm";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Student applications</h1>
          <p className="mt-2 text-sm leading-7 text-[var(--desk-ink-muted)]">
            Application forms and documents linked to your leads. Processing
            stages stay in sync with the pipeline.
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="desk-focus self-start text-sm underline"
        >
          All leads
        </Link>
      </div>
      <form className="grid items-end gap-3 rounded-2xl border border-[var(--desk-line)] p-4 sm:grid-cols-[1fr_1fr_auto]">
        {filters.lead && (
          <input type="hidden" name="lead" value={filters.lead} />
        )}
        <label className="text-sm">
          Search student or preferred university
          <input
            name="q"
            maxLength={120}
            defaultValue={filters.q}
            className={input}
          />
        </label>
        <label className="text-sm">
          Form completion
          <select name="status" defaultValue={filters.status} className={input}>
            <option value="">All forms</option>
            {formStatuses.map((s) => (
              <option key={s} value={s}>
                {formStatusLabels[s]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex min-h-11 items-center gap-4">
          <button className="desk-focus rounded-full bg-[var(--desk-accent)] px-5 py-3 text-sm font-semibold text-white">
            Filter
          </button>
          <Link
            href="/admin/applications"
            className="desk-focus text-sm underline"
          >
            Clear
          </Link>
        </div>
      </form>
      <p className="text-sm text-[var(--desk-ink-muted)]">
        {list.total} student file{list.total === 1 ? "" : "s"}
      </p>
      <div className="overflow-x-auto rounded-2xl border border-[var(--desk-line)]">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">
            Linked student application files
          </caption>
          <thead className="bg-[var(--desk-surface)]">
            <tr>
              {[
                "Student",
                "Preferred university / course",
                "Form",
                "Processing stage",
                "Last updated",
              ].map((h) => (
                <th key={h} className="p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.rows.map((row) => (
              <tr key={row.id} className="border-t border-[var(--desk-line)]">
                <td className="p-4">
                  <Link
                    href={`/admin/applications/${row.id}`}
                    className="desk-focus font-semibold underline"
                  >
                    {row.name}
                  </Link>
                  <Link
                    href={`/admin/leads?lead=${row.leadId}`}
                    className="desk-focus mt-2 block text-xs underline"
                  >
                    Open lead
                  </Link>
                </td>
                <td className="max-w-xs p-4">
                  {row.data?.preferredUniversity || "Preference not entered"}
                  <span className="mt-1 block text-xs text-[var(--desk-ink-muted)]">
                    {row.data?.course}
                  </span>
                </td>
                <td className="p-4">{formStatusLabels[row.formStatus]}</td>
                <td className="p-4">{leadStatusLabels[row.stage]}</td>
                <td className="p-4">
                  {formatLeadDate(row.updatedAt.toISOString())}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.rows.length && (
          <p className="p-8 text-center text-sm text-[var(--desk-ink-muted)]">
            No student files match. Enquiries remain in Leads; a file is created
            when a student account is linked.
          </p>
        )}
      </div>
      <nav
        aria-label="Application pages"
        className="flex justify-between text-sm"
      >
        {list.page > 1 ? (
          <Link className="desk-focus underline" href={href(list.page - 1)}>
            Previous
          </Link>
        ) : (
          <span />
        )}
        <span>
          Page {list.page} of {list.pageCount}
        </span>
        {list.page < list.pageCount ? (
          <Link className="desk-focus underline" href={href(list.page + 1)}>
            Next
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
