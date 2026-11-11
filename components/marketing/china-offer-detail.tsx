import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { chinaOffers, chinaRankingExamples } from "@/lib/china-2027";
import type { ChinaOffer } from "@/lib/china-2027/types";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import { programLevelLabels } from "@/lib/programs-labels";
import { getWhatsAppHref } from "@/lib/whatsapp";

function Points({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ChinaOfferDetail({
  offer,
  locale,
}: {
  offer: ChinaOffer;
  locale: Locale;
}) {
  const bn = locale === "bn";
  const href = (path: string) => localizedHref(path, locale);
  const ranking = chinaRankingExamples.find((u) => u.id === offer.universityId);
  const related = chinaOffers.filter(
    (other) =>
      other.universityId === offer.universityId && other.id !== offer.id,
  );
  const unavailable = offer.eligibility === "unavailable";
  const majorList = (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {offer.majors.map((major, i) => (
        <li
          key={`${major}-${i}`}
          className="rounded-xl bg-slate-50 p-3 text-sm leading-7 text-slate-700"
        >
          {major}
        </li>
      ))}
    </ul>
  );
  return (
    <article className="bg-slate-50 py-10 sm:py-16">
      <PageShell>
        <nav
          aria-label={bn ? "নেভিগেশন" : "Breadcrumb"}
          className="flex flex-wrap gap-3 text-sm text-slate-600"
        >
          <Link
            className="focus-ring underline"
            href={href("/destinations/china")}
          >
            {bn ? "চীনে পড়াশোনা" : "Study in China"}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            className="focus-ring underline"
            href={href("/programs?country=china")}
          >
            {bn ? "সব অফার" : "All offers"}
          </Link>
        </nav>
        <div className="mt-7 max-w-4xl">
          <p className="text-xs font-bold tracking-widest text-orange-700">
            {offer.intake.toUpperCase()} · {programLevelLabels[offer.level]}
          </p>
          <h1 className="font-heading mt-4 text-3xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {offer.university}
          </h1>
          <p className="mt-4 text-xl text-slate-700">{offer.title}</p>
          <p className="mt-3 text-sm text-slate-500">
            {offer.location} ·{" "}
            {bn
              ? "অফারের তথ্য ইংরেজিতে দেওয়া হয়েছে"
              : "Offer reviewed 10 November 2026"}
          </p>
          {ranking ? (
            <a
              target="_blank"
              rel="noreferrer"
              href={ranking.url}
              className="focus-ring mt-4 inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
            >
              QS World University Rankings 2027 · #{ranking.rank}
            </a>
          ) : null}
        </div>
        {offer.eligibility !== "eligible" ? (
          <div
            className={`mt-7 rounded-2xl border p-5 ${unavailable ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-950"}`}
          >
            <p className="font-semibold">
              {unavailable
                ? bn
                  ? "এই অফার বাংলাদেশি আবেদনকারীদের জন্য উন্মুক্ত নয়"
                  : "This offer is not open to Bangladeshi applicants"
                : bn
                  ? "আবেদনের আগে নির্বাচিত তথ্য নিশ্চিত করুন"
                  : "Confirm the highlighted details before applying"}
            </p>
            <p className="mt-2 text-sm leading-7">
              {unavailable
                ? bn
                  ? "অফারের দেশের তালিকায় বাংলাদেশ নেই। উপযুক্ত বিকল্প দেখতে অন্য অফার দেখুন।"
                  : "Bangladesh is excluded from the supplied country list. Explore an eligible alternative below."
                : bn
                  ? "যোগ্যতা, ভাষা বা ফি সম্পর্কে যেসব বিষয় নিশ্চিত করা দরকার, তা নিচের শর্তে দেওয়া আছে।"
                  : "The conditions below identify eligibility, language or fee details that need confirmation with the university."}
            </p>
          </div>
        ) : null}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                {bn ? "প্রোগ্রামের তথ্য" : "At a glance"}
              </h2>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  [bn ? "ইনটেক" : "Intake", offer.intake],
                  [bn ? "পড়ার মাধ্যম" : "Teaching language", offer.language],
                  [bn ? "মেয়াদ" : "Duration", offer.duration],
                  [
                    bn ? "টিউশন / প্যাকেজ" : "Tuition / package",
                    offer.tuition.display,
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-2 text-base leading-7 font-semibold text-slate-900">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-xs leading-6 text-slate-500">
                {bn
                  ? "সব খরচ CNY/RMB-তে। স্কলারশিপের সিদ্ধান্তের আগে মূল ফি ধরে বাজেট করুন; ছাড়ের পরের ফি ও প্যাকেজ আলাদাভাবে লেখা আছে।"
                  : "All fees are in CNY (RMB). Budget using original fees until an award is confirmed. After-scholarship and combined packages are explicitly labelled."}
              </p>
            </section>
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
              <p className="text-xs font-bold tracking-widest text-emerald-800">
                {bn ? "স্কলারশিপ" : "SCHOLARSHIP"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-emerald-950">
                {offer.scholarship.summary}
              </h2>
              <Points items={offer.scholarship.details} />
            </section>
            <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                {bn ? "ফি ও আবাসন" : "Fees and accommodation"}
              </h2>
              <dl className="mt-5 divide-y divide-stone-200">
                {offer.fees.map(({ label, value }) => (
                  <div
                    key={label}
                    className="grid gap-2 py-4 sm:grid-cols-[1fr_1.5fr]"
                  >
                    <dt className="text-sm font-semibold text-slate-700">
                      {label}
                    </dt>
                    <dd className="text-sm leading-7 text-slate-600">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs leading-6 text-slate-500">
                {bn
                  ? "খাবার, যাতায়াত ও ব্যক্তিগত খরচ আলাদা। আবেদন বা ডিপোজিট দেওয়ার আগে লিখিত ফি ও রিফান্ড পলিসি নিশ্চিত করুন।"
                  : "Meals, travel and personal expenses are additional. Confirm the university’s written fee breakdown and refund rules before paying application fees or deposits."}
              </p>
            </section>
            <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                {bn ? "যোগ্যতা ও শর্ত" : "Entry and progression requirements"}
              </h2>
              <Points items={offer.requirements} />
              {offer.notes.length > 0 ? (
                <>
                  <h3 className="mt-7 font-semibold text-slate-900">
                    {bn ? "আবেদনের আগে দেখুন" : "Before you apply"}
                  </h3>
                  <Points items={offer.notes} />
                </>
              ) : null}
            </section>
            <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                {bn ? "বিষয় ও কোর্স" : "Majors and course content"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {bn
                  ? "যেখানে উল্লেখ আছে, CSCA বিষয় ও ক্যাম্পাসের নামও দেওয়া হয়েছে।"
                  : "CSCA subjects and campus names are retained where the offer specifies them."}
              </p>
              {offer.majors.length > 12 ? (
                <details className="mt-4">
                  <summary className="focus-ring cursor-pointer rounded-lg py-3 font-semibold text-orange-700">
                    {bn
                      ? `সব ${offer.majors.length}টি বিষয় দেখুন`
                      : `View all ${offer.majors.length} majors and courses`}
                  </summary>
                  {majorList}
                </details>
              ) : (
                majorList
              )}
            </section>
            <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-slate-900">
                {bn ? "আবেদনের ডকুমেন্ট" : "Application documents"}
              </h2>
              <Points items={offer.documents} />
              <p className="mt-5 text-xs leading-6 text-slate-500">
                {bn
                  ? "বিশ্ববিদ্যালয় অতিরিক্ত ডকুমেন্ট, অনুবাদ বা সত্যায়ন চাইতে পারে।"
                  : "The university may request additional documents, translations or authentication after reviewing your application."}
              </p>
            </section>
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="rounded-3xl border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {bn ? "আবেদনের সময়সীমা" : "Application dates"}
              </h2>
              <dl className="mt-4 space-y-4">
                {offer.deadlines.map((d) => (
                  <div key={d.label}>
                    <dt className="text-xs font-semibold text-slate-500">
                      {d.label}
                    </dt>
                    <dd className="mt-1 font-semibold text-slate-900">
                      {d.date ? (
                        <time dateTime={d.date}>
                          {new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            timeZone: "UTC",
                          }).format(new Date(`${d.date}T00:00:00Z`))}
                        </time>
                      ) : (
                        d.display
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs leading-6 text-slate-500">
                {bn
                  ? "উল্লিখিত তারিখ অফারের তথ্য অনুযায়ী। আসন পূর্ণ হলে আগে বন্ধ হতে পারে।"
                  : "Dates follow the supplied offer. Applications may close earlier when places are filled; confirm availability before submitting."}
              </p>
            </section>
            <section className="rounded-3xl bg-[#0b2038] p-6 text-white">
              <h2 className="text-xl font-semibold">
                {unavailable
                  ? bn
                    ? "উপযুক্ত বিকল্প খুঁজুন"
                    : "Find an eligible alternative"
                  : bn
                    ? "এই অফার আপনার জন্য উপযুক্ত?"
                    : "Could this offer fit your profile?"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {bn
                  ? "আপনার ফলাফল, বাজেট ও পছন্দ জানান। প্রোফাইল দেখে কাউন্সেলর যোগাযোগ করবেন।"
                  : "Share your results, budget and preferences. A counsellor will review your profile and contact you about suitable next steps."}
              </p>
              <Link
                href={href(
                  unavailable
                    ? "/programs?country=china"
                    : `/consultation?destination=china&programId=${offer.id}`,
                )}
                className="btn-sunset focus-ring mt-5 flex min-h-12 items-center justify-center rounded-full px-4 text-center text-sm font-bold"
              >
                {unavailable
                  ? bn
                    ? "অন্য অফার দেখুন"
                    : "Explore other offers"
                  : bn
                    ? "ফ্রি প্রোফাইল অ্যাসেসমেন্ট"
                    : "Free profile assessment"}
              </Link>
              {!unavailable ? (
                <a
                  href={getWhatsAppHref(
                    `Hello, I would like to discuss ${offer.title} at ${offer.university}, ${offer.intake}. Please check my eligibility, fees and scholarship options.`,
                  )}
                  className="focus-ring mt-4 flex min-h-11 items-center justify-center rounded-full border border-white/30 px-4 text-center text-sm font-semibold text-white hover:bg-white/10"
                  target="_blank"
                  rel="noreferrer"
                >
                  {bn ? "WhatsApp-এ কথা বলুন" : "Discuss on WhatsApp"}
                </a>
              ) : null}
            </section>
          </aside>
        </div>
        {related.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold text-slate-900">
              {bn
                ? "এই প্রতিষ্ঠানের আরও অফার"
                : "More offers at this institution"}
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => (
                <li key={other.id}>
                  <Link
                    href={href(`/programs/${other.id}`)}
                    className="focus-ring block h-full rounded-2xl border border-stone-200 bg-white p-5 hover:border-orange-400"
                  >
                    <p className="text-xs font-semibold text-orange-700">
                      {other.intake} · {other.language}
                    </p>
                    <h3 className="mt-3 font-semibold text-slate-900">
                      {other.title}
                    </h3>
                    <p className="mt-3 text-xs leading-6 text-slate-600">
                      {other.tuition.display}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </PageShell>
    </article>
  );
}
