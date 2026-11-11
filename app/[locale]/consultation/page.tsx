import { AssessmentForm } from "@/components/consultation/assessment-form";
import { resolveLocale } from "@/lib/i18n/resolve-locale";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { getChinaOffer } from "@/lib/china-2027";
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props) {
  return pageMetadata({
    title: "Free Student Profile Assessment | Study Abroad Consultant",
    description:
      "Request a free study abroad profile assessment. Share your academic background and explore suitable university admission and scholarship opportunities with Study Abroad Consultant.",
    path: "/consultation",
    locale: await resolveLocale(params),
  });
}
export default async function Consultation({ params, searchParams }: Props) {
  const locale = await resolveLocale(params);
  const query = await searchParams;
  const offer =
    typeof query.programId === "string"
      ? getChinaOffer(query.programId)
      : undefined;
  const china = query.destination === "china" || Boolean(offer);
  return (
    <main className="bg-slate-50 px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <AssessmentForm
          locale={locale}
          initialStudyPlan={
            china
              ? {
                  country: "China",
                  intake: offer
                    ? offer.intake === "March 2027"
                      ? "2027-03"
                      : "2027-09"
                    : "",
                  otherInformation: offer
                    ? `Interested in ${offer.title} at ${offer.university}, ${offer.intake}.`
                    : "",
                }
              : undefined
          }
          introduction={
            <header className="mb-10 max-w-3xl">
              <p className="mb-3 text-sm font-semibold tracking-wider text-[#92702c] uppercase">
                Study Abroad Consultant
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-[#102b4e] sm:text-4xl">
                {locale === "bn"
                  ? "বিনামূল্যে শিক্ষার্থী প্রোফাইল মূল্যায়ন"
                  : "Free Student Profile Assessment"}
              </h1>
              <p className="mt-4 text-xl font-medium text-slate-800">
                Check Your Admission &amp; Scholarship Opportunities
              </p>
              <p className="mt-4 leading-7 text-slate-600">
                {locale === "bn"
                  ? "আপনার শিক্ষাগত যোগ্যতা ও পড়াশোনার পছন্দ সম্পর্কে জানান। উপযুক্ত বিশ্ববিদ্যালয়, বৃত্তি ও ভর্তির সুযোগ খুঁজে পেতে আমরা আপনাকে সহায়তা করব।"
                  : "Share your academic background and study preferences so we can help you explore suitable universities, scholarships and admission opportunities."}
              </p>
              <p className="mt-3 text-sm text-slate-600">
                {locale === "bn"
                  ? "আপনার প্রোফাইল মূল্যায়ন সবসময় বিনামূল্যে।"
                  : "Your profile assessment is always free."}
              </p>
              <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="font-semibold text-[#102b4e]">
                  {locale === "bn"
                    ? "এই তথ্যগুলো কেন প্রয়োজন?"
                    : "Why do we need this information?"}
                </h2>
                <p className="mt-2 leading-7 text-slate-600">
                  {locale === "bn"
                    ? "আপনার জন্য একজন নিবেদিত কাউন্সেলর নিয়োগ করা হবে। তিনি এই তথ্যের ভিত্তিতে আপনার প্রোফাইল মূল্যায়ন করবেন এবং আপনার লক্ষ্য ও যোগ্যতা অনুযায়ী পড়াশোনার সঠিক পথ বেছে নিতে আপনাকে দিকনির্দেশনা দেবেন।"
                    : "A dedicated counsellor will be assigned to you. They will use this information to assess your profile and guide you towards a study path that fits your goals and qualifications."}
                </p>
              </section>
            </header>
          }
        />
      </div>
    </main>
  );
}
