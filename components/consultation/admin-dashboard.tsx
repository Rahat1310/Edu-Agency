import Link from "next/link";
import { LeadDeleteButton } from "@/components/admin/lead-delete-button";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { leads, counselorProfiles } from "@/db/schema";
import { countries, statuses } from "@/lib/consultation/schema";
import {
  formatAssessmentDate,
  formatAssessmentStatus,
} from "@/lib/consultation/presentation";
export async function AssessmentDashboard({
  params,
  canDelete = false,
}: {
  params: Record<string, string | string[] | undefined>;
  canDelete?: boolean;
}) {
  const get = (k: string) =>
    typeof params[k] === "string" ? (params[k] as string).slice(0, 160) : "";
  const q = get("q");
  const status = get("status");
  const country = get("country");
  const counselor = get("counselor");
  const from = get("from"),
    to = get("to");
  const page = Math.max(
    1,
    Math.min(100000, Math.floor(Number(get("page"))) || 1),
  );
  const filters = [sql`${leads.assessment} IS NOT NULL`];
  if (q) {
    const pattern = `%${q.replace(/[\\%_]/g, "")}%`;
    filters.push(
      or(
        ilike(leads.name, pattern),
        ilike(leads.phone, pattern),
        ilike(leads.reference, pattern),
      )!,
    );
  }
  if (statuses.some((s) => s === status))
    filters.push(eq(leads.assessmentStatus, status));
  if (country) filters.push(sql`${leads.assessment}->>'country' = ${country}`);
  if (/^[0-9a-f-]{36}$/i.test(counselor))
    filters.push(eq(leads.assignedCounselorId, counselor));
  if (counselor === "unassigned")
    filters.push(sql`${leads.assignedCounselorId} IS NULL`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(from) && Number.isFinite(Date.parse(from)))
    filters.push(
      sql`${leads.createdAt} >= (${from}::date AT TIME ZONE 'Asia/Dhaka')`,
    );
  if (/^\d{4}-\d{2}-\d{2}$/.test(to) && Number.isFinite(Date.parse(to)))
    filters.push(
      sql`${leads.createdAt} < ((${to}::date + interval '1 day') AT TIME ZONE 'Asia/Dhaka')`,
    );
  const [rows, total, counts, counselors] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(and(...filters))
      .orderBy(desc(leads.createdAt), desc(leads.id))
      .limit(25)
      .offset((page - 1) * 25),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(...filters)),
    db
      .select({ status: leads.assessmentStatus, n: sql<number>`count(*)::int` })
      .from(leads)
      .where(sql`${leads.assessment} IS NOT NULL`)
      .groupBy(leads.assessmentStatus),
    db.select().from(counselorProfiles),
  ]);
  const href = (p: number) => {
    const search = new URLSearchParams();
    Object.keys(params).forEach((k) => {
      if (get(k)) search.set(k, get(k));
    });
    search.set("page", String(p));
    return `/admin/leads?${search}`;
  };
  const input =
    "mt-1 w-full rounded border border-slate-300 bg-white p-2 text-slate-900";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-2xl font-semibold">Student assessments</h1>
        <Link href="/admin/leads?view=legacy" className="underline">
          All enquiries & existing CRM
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
        {["TOTAL", ...statuses].map((s) => (
          <div
            key={s}
            className="rounded-xl border border-slate-200 bg-white p-3"
          >
            <p className="text-xs">{formatAssessmentStatus(s)}</p>
            <strong className="text-2xl">
              {s === "TOTAL"
                ? counts.reduce((n, r) => n + r.n, 0)
                : (counts.find((r) => r.status === s)?.n ?? 0)}
            </strong>
          </div>
        ))}
      </div>
      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <label>
          Search name, phone or reference
          <input name="q" defaultValue={q} className={input} />
        </label>
        <label>
          Destination
          <select name="country" defaultValue={country} className={input}>
            <option value="">All destinations</option>
            {countries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={status} className={input}>
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {formatAssessmentStatus(s)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Counsellor
          <select name="counselor" defaultValue={counselor} className={input}>
            <option value="">All counsellors</option>
            <option value="unassigned">Unassigned</option>
            {counselors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </label>
        <label>
          From (Dhaka)
          <input
            type="date"
            name="from"
            defaultValue={from}
            className={input}
          />
        </label>
        <label>
          Through (Dhaka)
          <input type="date" name="to" defaultValue={to} className={input} />
        </label>
        <button className="rounded bg-slate-900 p-2 text-white">
          Apply filters
        </button>
        <Link href="/admin/leads" className="p-2 underline">
          Reset
        </Link>
      </form>
      <p>{total[0]?.n ?? 0} matching assessments</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {[
                "Reference / student",
                "Contact",
                "Destination / degree",
                "Status",
                "Submitted (Dhaka)",
              ].map((h) => (
                <th key={h} className="p-4">
                  {h}
                </th>
              ))}
              {canDelete && <th className="p-4">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="p-4">
                  <Link
                    href={`/admin/leads/${l.id}`}
                    className="font-semibold text-blue-800 underline"
                  >
                    {l.reference}
                  </Link>
                  <p>{l.name}</p>
                </td>
                <td className="p-4">{l.phone}</td>
                <td className="p-4">
                  {l.assessment?.country}
                  <p>{l.assessment?.degree}</p>
                </td>
                <td className="p-4">
                  {formatAssessmentStatus(l.assessmentStatus)}
                </td>
                <td className="p-4">{formatAssessmentDate(l.createdAt)}</td>
                {canDelete && (
                  <td className="p-4">
                    <LeadDeleteButton
                      leadId={l.id}
                      name={l.name}
                      returnHref={href(
                        rows.length === 1 && page > 1 ? page - 1 : page,
                      )}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="p-6">No assessments match these filters.</p>
        )}
      </div>
      <nav aria-label="Lead pagination" className="flex gap-5">
        {page > 1 && <Link href={href(page - 1)}>Previous</Link>}
        <span>Page {page}</span>
        {page * 25 < (total[0]?.n ?? 0) && (
          <Link href={href(page + 1)}>Next</Link>
        )}
      </nav>
    </div>
  );
}
