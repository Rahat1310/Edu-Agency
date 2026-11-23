import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { MalaysiaCompare } from "./malaysia-compare";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import { malaysiaCopy, malaysiaLevelLabel } from "@/lib/malaysia/copy";
import {
  malaysiaInstitutions,
  malaysiaProgrammes,
  getMalaysiaSchedules,
} from "@/lib/malaysia";
import type {
  MalaysiaInstitution,
  MalaysiaProgramme,
  MalaysiaSchedule,
} from "@/lib/malaysia/types";

export type MalaysiaQuery = {
  field?: string;
  level?: string;
  university?: string;
  mode?: string;
  intake?: string;
  page?: string;
  ids?: string;
};
export const malaysiaInstitutionPath = (id: string) =>
  `/destinations/malaysia/universities/${id}`;
const button =
  "focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700";
const input =
  "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900";
const select = (
  name: string,
  label: string,
  value: string | undefined,
  values: string[],
  locale: Locale,
  levels = false,
) => (
  <label className="text-sm font-semibold" key={name}>
    {label}
    <select name={name} defaultValue={value ?? ""} className={input}>
      <option value="">{malaysiaCopy(locale).all}</option>
      {values.map((v) => (
        <option key={v} value={v}>
          {levels ? malaysiaLevelLabel(v, locale) : v}
        </option>
      ))}
    </select>
  </label>
);
function matches(p: MalaysiaProgramme, query: MalaysiaQuery) {
  const inst = malaysiaInstitutions.find((i) => i.id === p.institutionId)!;
  const needle = (query.field ?? "").trim().toLowerCase();
  return (
    (!query.level || p.level === query.level) &&
    (!query.mode || p.mode === query.mode) &&
    (!query.intake || p.intakes.includes(query.intake)) &&
    (!query.university ||
      [inst.id, inst.name, ...inst.aliases].some((x) =>
        x.toLowerCase().includes(query.university!.toLowerCase()),
      )) &&
    (!needle ||
      [p.title, p.code, p.campus, p.provider, inst.name, ...inst.aliases]
        .join(" ")
        .toLowerCase()
        .includes(needle))
  );
}
export function MalaysiaCatalogue({
  locale,
  query = {},
}: {
  locale: Locale;
  query?: MalaysiaQuery;
}) {
  const c = malaysiaCopy(locale);
  const filtered = malaysiaInstitutions.filter((i) =>
    i.kind === "reference"
      ? !query.level &&
        (!query.field ||
          [i.name, ...i.aliases]
            .join(" ")
            .toLowerCase()
            .includes(query.field.toLowerCase())) &&
        (!query.university ||
          [i.id, i.name, ...i.aliases]
            .join(" ")
            .toLowerCase()
            .includes(query.university.toLowerCase()))
      : malaysiaProgrammes.some(
          (p) => p.institutionId === i.id && matches(p, query),
        ),
  );
  return (
    <section className="bg-slate-50 py-12 sm:py-20">
      <PageShell>
        <Link
          href={localizedHref("/programs", locale)}
          className="focus-ring text-sm font-bold text-orange-700"
        >
          ← {locale === "bn" ? "সব দেশের প্রোগ্রাম" : "All countries"}
        </Link>
        <p className="mt-8 text-sm font-bold tracking-widest text-orange-700 uppercase">
          Malaysia · {malaysiaInstitutions.length}{" "}
          {locale === "bn" ? "প্রতিষ্ঠান" : "institutions"}
        </p>
        <h1 className="font-heading mt-3 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          {c.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          {c.intro}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className={button}
            href={localizedHref("/consultation?destination=malaysia", locale)}
          >
            {c.assessment}
          </Link>
          <a
            href="#schools"
            className="focus-ring inline-flex min-h-11 items-center px-4 font-bold text-orange-700 underline"
          >
            {c.schools}
          </a>
        </div>
        <p className="mt-6 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
          {c.dated}
        </p>
        <form
          action={localizedHref("/programs", locale)}
          className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[2fr_1fr_auto]"
        >
          <input type="hidden" name="country" value="malaysia" />
          <label className="text-sm font-semibold">
            {c.search}
            <input
              className={input}
              type="search"
              name="field"
              defaultValue={query.field}
              maxLength={200}
            />
          </label>
          {select(
            "level",
            c.level,
            query.level,
            [...new Set(malaysiaProgrammes.map((p) => p.level))].sort(),
            locale,
            true,
          )}
          <button className={`${button} self-end`} type="submit">
            {c.apply}
          </button>
          {query.university && (
            <input type="hidden" name="university" value={query.university} />
          )}
          <Link
            className="focus-ring min-h-11 py-2 text-sm font-semibold text-orange-700 underline"
            href={localizedHref("/programs?country=malaysia", locale)}
          >
            {c.reset}
          </Link>
        </form>
        {filtered.length === 0 && (
          <p role="status" className="py-12">
            {c.empty}
          </p>
        )}
        {([false, true] as const).map((schools) => (
          <section
            key={String(schools)}
            id={schools ? "schools" : "universities"}
            className="mt-12 scroll-mt-24"
          >
            <h2 className="font-heading text-2xl font-bold text-slate-900">
              {schools ? c.schools : c.title}
            </h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered
                .filter((i) => (i.kind === "school") === schools)
                .map((i) => {
                  const rows = malaysiaProgrammes.filter(
                    (p) => p.institutionId === i.id,
                  );
                  return (
                    <li
                      key={i.id}
                      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="font-heading text-xl font-bold">
                        <Link
                          className="focus-ring block min-h-11 text-slate-900 hover:text-orange-700"
                          href={localizedHref(
                            malaysiaInstitutionPath(i.id),
                            locale,
                          )}
                        >
                          {i.name} <span aria-hidden="true">↗</span>
                        </Link>
                      </h3>
                      <p className="mt-3 text-sm text-slate-600">
                        {i.kind === "reference"
                          ? c.reference
                          : `${rows.length} ${c.programmes}`}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {[
                          ...new Set(
                            rows.map((p) =>
                              malaysiaLevelLabel(p.level, locale),
                            ),
                          ),
                        ].join(" · ")}
                      </p>
                      <Link
                        className="focus-ring mt-auto inline-flex min-h-11 items-center pt-5 text-sm font-bold text-orange-700"
                        href={localizedHref(
                          malaysiaInstitutionPath(i.id),
                          locale,
                        )}
                      >
                        {c.fees} →
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
        <p className="mt-10 max-w-3xl text-sm leading-7 text-slate-600">
          {c.note}
        </p>
      </PageShell>
    </section>
  );
}
export function MalaysiaInstitutionPage({
  institution,
  locale,
  query,
}: {
  institution: MalaysiaInstitution;
  locale: Locale;
  query: MalaysiaQuery;
}) {
  const c = malaysiaCopy(locale);
  const all = malaysiaProgrammes.filter(
    (p) => p.institutionId === institution.id,
  );
  const rows = all.filter((p) => matches(p, query));
  const pageCount = Math.max(1, Math.ceil(rows.length / 24));
  const parsed = Number(query.page ?? 1);
  const page = Math.max(
    1,
    Math.min(Number.isFinite(parsed) ? Math.floor(parsed) : 1, pageCount),
  );
  const visible = rows.slice((page - 1) * 24, page * 24);
  const groups = [
    ...new Set(visible.map((p) => `${p.campus ?? c.unknown}|${p.level}`)),
  ];
  const href = (p: number) => {
    const params = new URLSearchParams(
      Object.entries({ ...query, page: String(p) }).filter(([, v]) =>
        Boolean(v),
      ) as [string, string][],
    );
    return `${localizedHref(malaysiaInstitutionPath(institution.id), locale)}?${params}`;
  };
  return (
    <article className="bg-slate-50 py-12 sm:py-20">
      <PageShell>
        <Link
          className="focus-ring inline-flex min-h-11 items-center font-bold text-orange-700"
          href={localizedHref("/programs?country=malaysia", locale)}
        >
          ← {c.back}
        </Link>
        <h1 className="font-heading mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {institution.name}
        </h1>
        {institution.aliases.length > 0 && (
          <p className="mt-3 text-sm text-slate-600">
            {institution.aliases.join(" · ")}
          </p>
        )}
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          {c.dated}
        </p>
        {institution.notes.map((note) => (
          <p key={note} className="mt-3 max-w-3xl text-sm leading-7">
            {note}
          </p>
        ))}
        {institution.links.map((link) => (
          <a
            key={link.url}
            className="focus-ring mt-4 inline-flex min-h-11 items-center font-bold text-orange-700 underline"
            href={link.url}
            rel="noreferrer"
          >
            {link.label} ↗
          </a>
        ))}
        <div className="mt-6">
          <Link
            className={button}
            href={localizedHref("/consultation?destination=malaysia", locale)}
          >
            {c.assessment}
          </Link>
        </div>
        {all.length > 0 && (
          <>
            <form
              action={localizedHref(
                malaysiaInstitutionPath(institution.id),
                locale,
              )}
              className="mt-10 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              <label className="text-sm font-semibold">
                {c.search}
                <input
                  className={input}
                  name="field"
                  type="search"
                  defaultValue={query.field}
                  maxLength={200}
                />
              </label>
              {select(
                "level",
                c.level,
                query.level,
                [...new Set(all.map((p) => p.level))].sort(),
                locale,
                true,
              )}
              {select(
                "mode",
                c.mode,
                query.mode,
                [
                  ...new Set(all.flatMap((p) => (p.mode ? [p.mode] : []))),
                ].sort(),
                locale,
              )}
              {select(
                "intake",
                c.intake,
                query.intake,
                [...new Set(all.flatMap((p) => p.intakes))].sort(),
                locale,
              )}
              {query.ids && (
                <input type="hidden" name="ids" value={query.ids} />
              )}
              <button className={button} type="submit">
                {c.apply}
              </button>
              <Link
                className="focus-ring inline-flex min-h-11 items-center font-bold text-orange-700 underline"
                href={localizedHref(
                  malaysiaInstitutionPath(institution.id),
                  locale,
                )}
              >
                {c.reset}
              </Link>
            </form>
            <p role="status" className="mt-6 text-sm text-slate-600">
              {rows.length} {c.results} · {c.page} {page} / {pageCount}
            </p>
            {!rows.length && <p className="py-12">{c.empty}</p>}
            {groups.map((group) => {
              const [campus, lev] = group.split("|");
              return (
                <section key={group} className="mt-10">
                  <h2 className="font-heading text-2xl font-bold">
                    {malaysiaLevelLabel(lev ?? "", locale)}
                    {campus !== c.unknown ? ` · ${campus}` : ""}
                  </h2>
                  <ul className="mt-5 grid gap-4 md:grid-cols-2">
                    {visible
                      .filter(
                        (p) => `${p.campus ?? c.unknown}|${p.level}` === group,
                      )
                      .map((p) => (
                        <li
                          key={p.id}
                          id={`programme-${p.id}`}
                          className="rounded-2xl border border-slate-200 bg-white p-6"
                        >
                          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            {[p.provider, p.mode].filter(Boolean).join(" · ")}
                          </p>
                          <h3 className="mt-2 text-lg leading-7 font-bold">
                            <Link
                              className="focus-ring text-slate-900 hover:text-orange-700"
                              href={localizedHref(`/programs/${p.id}`, locale)}
                            >
                              {p.title}
                            </Link>
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {p.duration ?? c.unknown}
                          </p>
                          <Link
                            className="focus-ring mt-3 inline-flex min-h-11 items-center text-sm font-bold text-orange-700"
                            href={localizedHref(`/programs/${p.id}`, locale)}
                          >
                            {c.fees} →
                          </Link>
                          <MalaysiaCompare id={p.id} locale={locale} />
                        </li>
                      ))}
                  </ul>
                </section>
              );
            })}
            {pageCount > 1 && (
              <nav aria-label={c.page} className="mt-8 flex flex-wrap gap-4">
                {page > 1 && (
                  <Link className={button} href={href(page - 1)}>
                    {c.previous}
                  </Link>
                )}
                {page < pageCount && (
                  <Link className={button} href={href(page + 1)}>
                    {c.next}
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </PageShell>
    </article>
  );
}
function FeeSchedule({
  schedule: s,
  locale,
}: {
  schedule: MalaysiaSchedule;
  locale: Locale;
}) {
  const c = malaysiaCopy(locale);
  return (
    <section
      id={`schedule-${s.id}`}
      className="mt-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 sm:p-7"
    >
      <h3 className="text-xl font-bold text-slate-900">{s.label}</h3>
      <p className="mt-3 text-sm font-bold text-amber-900">
        {s.status === "historical" ? c.historical : c.confirmation} · {s.period}
      </p>
      <p className="mt-3 text-sm leading-7">{s.audience}</p>
      {s.tables.map((t, index) => (
        <div
          key={index}
          role="region"
          tabIndex={0}
          aria-label={t.caption}
          className="focus-ring mt-5 overflow-x-auto rounded-xl border border-slate-200"
        >
          <table className="w-full min-w-[30rem] text-left text-sm">
            <caption className="bg-slate-100 p-3 text-left font-bold text-slate-900">
              {t.caption}
            </caption>
            <thead>
              <tr>
                {t.headers.map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="border-b border-slate-200 px-4 py-3 align-top"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  {r.map((cell, j) =>
                    j === 0 ? (
                      <th
                        key={j}
                        scope="row"
                        className="px-4 py-3 align-top font-medium"
                      >
                        {cell || c.unknown}
                      </th>
                    ) : (
                      <td
                        key={j}
                        className="px-4 py-3 align-top whitespace-pre-line tabular-nums"
                      >
                        {cell || c.unknown}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <details className="mt-5 rounded-xl bg-slate-50 p-4" open>
        <summary className="focus-ring min-h-11 cursor-pointer font-bold">
          {c.conditions}
        </summary>
        <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-7">
          {s.terms.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </details>
      <p className="mt-5 text-xs leading-6 text-slate-500">
        {c.source}:{" "}
        {s.refs
          .map(
            (r) =>
              `${r.title} · ${r.period} · ${locale === "bn" ? "পৃষ্ঠা" : "page"} ${r.page}`,
          )
          .join("; ")}
      </p>
    </section>
  );
}
export function MalaysiaProgrammeDetail({
  programme: p,
  institution: i,
  locale,
}: {
  programme: MalaysiaProgramme;
  institution: MalaysiaInstitution;
  locale: Locale;
}) {
  const c = malaysiaCopy(locale);
  const schedules = getMalaysiaSchedules(p);
  return (
    <article className="bg-slate-50 py-12 sm:py-20">
      <PageShell className="max-w-5xl">
        <Link
          className="focus-ring inline-flex min-h-11 items-center font-bold text-orange-700"
          href={localizedHref(malaysiaInstitutionPath(i.id), locale)}
        >
          ← {i.name}
        </Link>
        <p className="mt-6 text-sm font-bold text-orange-700">
          Malaysia · {malaysiaLevelLabel(p.level, locale)}
        </p>
        <h1 className="font-heading mt-3 text-3xl leading-tight font-bold tracking-tight text-slate-900 sm:text-5xl">
          {p.title}
        </h1>
        <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          {[
            [c.provider, p.provider],
            [c.campus, p.campus],
            [c.level, malaysiaLevelLabel(p.level, locale)],
            [c.mode, p.mode],
            [c.duration, p.duration],
            [c.intake, p.intakes.join(" · ")],
            [c.code, p.code],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold text-slate-500 uppercase">
                {label}
              </dt>
              <dd className="mt-2 text-sm leading-6">{value || c.unknown}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6">
          <Link
            className={button}
            href={localizedHref(
              `/consultation?destination=malaysia&programId=${p.id}`,
              locale,
            )}
          >
            {c.assessment}
          </Link>
          <MalaysiaCompare id={p.id} locale={locale} />
        </div>
        <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <p>{c.dated}</p>
          <p className="mt-2">{c.basis}</p>
        </div>
        {p.notes.map((note) => (
          <p key={note} className="mt-4 text-sm leading-7">
            {note}
          </p>
        ))}
        <h2 className="font-heading mt-12 text-2xl font-bold">{c.schedules}</h2>
        <nav aria-label={c.schedules} className="mt-4 flex flex-wrap gap-3">
          {schedules.map((s) => (
            <a
              key={s.id}
              className="focus-ring inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold"
              href={`#schedule-${s.id}`}
            >
              {s.label}
            </a>
          ))}
        </nav>
        {schedules.map((s) => (
          <FeeSchedule key={s.id} schedule={s} locale={locale} />
        ))}
        <p className="mt-8 text-sm leading-7 text-slate-600">{c.note}</p>
      </PageShell>
    </article>
  );
}
