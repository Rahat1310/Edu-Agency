import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  GraduationCap,
  Landmark,
  Languages,
  Microscope,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  chinaOffers,
  chinaInstitutions,
  chinaRankingExamples,
} from "@/lib/china-2027";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";

export function ChinaDestinationPage({ locale }: { locale: Locale }) {
  const bn = locale === "bn";
  const href = (path: string) => localizedHref(path, locale);
  const explore = href("/programs?country=china");
  const c = bn
    ? {
        eyebrow: "চীনে উচ্চশিক্ষা · ২০২৭ ইনটেক",
        title: "আপনার পরবর্তী ক্যাম্পাস হতে পারে চীনে।",
        body: "আন্তর্জাতিক মানের গবেষণা, আধুনিক ক্যাম্পাস এবং স্কলারশিপের সুযোগ—নিজের ফলাফল, পছন্দের বিষয় ও বাজেট অনুযায়ী চীনে পড়াশোনার পথ খুঁজুন।",
        explore: "বিশ্ববিদ্যালয় ও প্রোগ্রাম দেখুন",
        assessment: "ফ্রি প্রোফাইল অ্যাসেসমেন্ট",
        offers: "প্রোগ্রাম অফার",
        institutions: "শিক্ষাপ্রতিষ্ঠান",
        intakes: "ইনটেক",
        caption: "Huazhong University of Science and Technology · Wuhan",
        why: "চীনকে কেন বিবেচনা করবেন?",
        whyBody:
          "শুধু বিশ্ববিদ্যালয়ের নাম নয়—আপনি কী শিখবেন, কোথায় থাকবেন এবং পুরো খরচ কত হবে, সেগুলো মিলিয়েই বেছে নিন।",
        reasons: [
          [
            "পছন্দের বিষয় ও পড়ার মাধ্যম",
            "Engineering, Computer Science, Business, Medicine ও অন্যান্য বিষয়ে ইংরেজি ও চীনা মাধ্যমে পড়ার বিকল্প রয়েছে। প্রতিটি কোর্সের ভাষার শর্ত আলাদা।",
          ],
          [
            "বিভিন্ন বাজেটের জন্য বিকল্প",
            "টিউশন ছাড়, আংশিক স্কলারশিপ ও কিছু অফারে আবাসন বা স্টাইপেন্ডের সুবিধা রয়েছে। কোন খরচ নিজের বহন করতে হবে, তা অফার খুলেই দেখুন।",
          ],
          [
            "ক্যাম্পাসের বাইরেও শেখা",
            "Mandarin শেখা, নতুন সংস্কৃতির সঙ্গে পরিচয় এবং আন্তর্জাতিক সহপাঠীদের সঙ্গে পড়াশোনা আপনার অভিজ্ঞতা সমৃদ্ধ করতে পারে।",
          ],
        ],
        facilities: "ক্লাসরুম থেকে ক্যাম্পাস জীবন",
        facilitiesBody:
          "প্রতিষ্ঠান ও ক্যাম্পাসভেদে সুবিধা আলাদা। আপনার অফারের আবাসন, রুমের ধরন ও অতিরিক্ত খরচ মিলিয়ে দেখুন।",
        facilityCards: [
          [
            "পড়াশোনা ও গবেষণা",
            "লাইব্রেরি, ল্যাব ও গবেষণার পরিবেশ সম্পর্কে আপনার বিভাগভিত্তিক তথ্য জেনে নিন।",
          ],
          [
            "আবাসনের বিকল্প",
            "কিছু অফারে দুই বা চারজনের ডরমিটরি রয়েছে; অন্যগুলোতে বাইরে বাসা নিতে হবে।",
          ],
          [
            "খাবার ও দৈনন্দিন জীবন",
            "HUST-এর মতো ক্যাম্পাসে ক্যান্টিন ও মুসলিম ডাইনিংয়ের সুবিধা রয়েছে। প্রতিটি ক্যাম্পাসের খাবারের ব্যবস্থা আলাদাভাবে যাচাই করুন।",
          ],
          [
            "ক্লাব ও খেলাধুলা",
            "একাডেমিক ক্লাব, সাংস্কৃতিক কার্যক্রম ও খেলাধুলায় অংশ নেওয়ার সুযোগ সম্পর্কে জানুন।",
          ],
        ],
        ranks: "আপনার তালিকায় বিশ্ব র‍্যাঙ্কিংয়ের বিশ্ববিদ্যালয়",
        ranksBody:
          "নিচের সব প্রতিষ্ঠানই আমাদের বর্তমান অফারের তালিকায় রয়েছে। র‍্যাঙ্কিং দিয়ে বিষয়, খরচ ও যোগ্যতার পুরো চিত্র বোঝা যায় না।",
        rankSource:
          "QS World University Rankings 2027 · যাচাই: ১০ নভেম্বর ২০২৬",
        funding: "স্কলারশিপে কোন খরচ অন্তর্ভুক্ত?",
        fundingBody:
          "100% tuition scholarship মানে শুধু টিউশন ফি মওকুফ। আবাসন, খাবার ও অন্যান্য খরচ অন্তর্ভুক্ত কি না, তা আলাদা করে দেখুন।",
        awards: [
          [
            "টিউশন স্কলারশিপ",
            "নির্বাচিত ডিগ্রি অফারে পূর্ণ বা আংশিক টিউশন ছাড় রয়েছে। পরবর্তী বছরের জন্য ফলাফল ও রিভিউয়ের শর্ত থাকতে পারে।",
          ],
          [
            "আবাসন ও স্টাইপেন্ডসহ অফার",
            "NJIT-এর প্রথম বছরের অফার ও BNU Zhuhai-এর নির্বাচিত অ্যাওয়ার্ডে অতিরিক্ত সুবিধা আছে। পরিমাণ ও মেয়াদ অফারভেদে আলাদা।",
          ],
          [
            "Chinese Government Scholarship",
            "যোগ্য প্রোগ্রামে পূর্ণ CSC অ্যাওয়ার্ডে টিউশন, আবাসন বা ভাতা, মাসিক স্টাইপেন্ড ও মেডিকেল ইনস্যুরেন্স থাকতে পারে। প্রতিটি তালিকাভুক্ত প্রোগ্রামে এই সুবিধা প্রযোজ্য নয়।",
          ],
        ],
        routes: "আপনার জন্য কোন ইনটেক?",
        spring: "March 2027",
        springBody:
          "Chinese Language, Foundation ও ডিগ্রির প্রস্তুতি কোর্সের পাশাপাশি সরাসরি Bachelor’s, Master’s ও PhD অফার দেখুন। প্রস্তুতি কোর্স থেকে ডিগ্রিতে যাওয়ার শর্ত প্রতিটি অফারে দেওয়া আছে।",
        autumn: "September 2027",
        autumnBody:
          "ইংরেজি ও চীনা মাধ্যমে Bachelor’s, Master’s ও PhD অফার দেখুন। বিষয়ভেদে CSCA, HSK বা English proficiency লাগতে পারে।",
        browse: "অফার দেখুন",
        csca: "Bachelor’s-এর আগে CSCA ও ভাষার শর্ত দেখুন",
        cscaBody:
          "Foundation বা ভাষা কোর্সে ভর্তি হলেই Bachelor’s নিশ্চিত হয় না। CSCA, পরীক্ষার বিষয়, HSK ও progression-এর শর্ত প্রতিটি অফারে দেখুন।",
        support: "আপনার ফলাফল ও বাজেট দিয়ে শুরু করুন।",
        supportBody:
          "ফর্মে আপনার শিক্ষাগত তথ্য ও পছন্দ জানান। প্রোফাইল দেখার পর কাউন্সেলর উপযুক্ত বিকল্প, স্কলারশিপের শর্ত, ডকুমেন্ট ও পরবর্তী ধাপ নিয়ে যোগাযোগ করবেন।",
        faq: "আপনার প্রশ্ন",
        questions: [
          [
            "IELTS ছাড়া আবেদন করা যাবে?",
            "কিছু অফারে MOI বা বিকল্প প্রমাণ গ্রহণের কথা আছে। অন্যগুলোতে IELTS, TOEFL, Duolingo বা HSK বাধ্যতামূলক। নিজের নির্বাচিত অফারের শর্ত দেখুন।",
          ],
          [
            "স্কলারশিপ কি নিশ্চিত?",
            "না। যোগ্যতা, মূল্যায়ন, আসন ও বিশ্ববিদ্যালয়ের সিদ্ধান্ত অনুযায়ী স্কলারশিপ হয়। ভর্তি ও স্কলারশিপ আলাদা সিদ্ধান্ত হতে পারে।",
          ],
          [
            "ডরমিটরিতে থাকা যাবে?",
            "সব অফারে নয়। কিছু প্রতিষ্ঠানে জায়গা সীমিত, আবার কিছু অফারে বাইরে বাসা নিতে হয়। বুকিং ও খরচ নিশ্চিত করুন।",
          ],
        ],
      }
    : {
        eyebrow: "STUDY IN CHINA · 2027 INTAKES",
        title: "Your next campus could be in China.",
        body: "Explore ambitious universities, well-equipped campuses and scholarship opportunities. Find a study route that fits your results, your subject and your family’s budget.",
        explore: "Explore universities & programs",
        assessment: "Free profile assessment",
        offers: "program offers",
        institutions: "institutions",
        intakes: "intakes",
        caption: "Huazhong University of Science and Technology · Wuhan",
        why: "A lot to learn. More to discover.",
        whyBody:
          "Look beyond a university name. Consider what you will study, how you will live and what your full budget needs to cover.",
        reasons: [
          [
            "Study the subject that interests you",
            "Explore engineering, computer science, business, medicine and other fields. English- and Chinese-taught options have different entry and language requirements.",
          ],
          [
            "Find a route that fits your budget",
            "Compare original tuition with partial and full tuition awards. Selected offers also include housing or a stipend, with the exact coverage shown on each offer.",
          ],
          [
            "Build experience in a new setting",
            "Learn Mandarin, discover Chinese culture and study alongside international classmates. A language or foundation course can help you prepare for your next academic step.",
          ],
        ],
        facilities: "Picture your everyday campus life.",
        facilitiesBody:
          "Facilities vary by university and campus. Check the room type, availability and costs for the offer you choose.",
        facilityCards: [
          [
            "Space to study and research",
            "Explore libraries, laboratories and academic facilities relevant to your department. HUST’s campus information includes its library and student learning environment.",
          ],
          [
            "A place to live",
            "Several offers list double or four-person dormitories. Some require off-campus housing; a room is only confirmed after the university accepts your booking.",
          ],
          [
            "Food and daily essentials",
            "Campuses such as HUST list canteens and Muslim dining options. Check the food arrangements and nearby services at your own campus.",
          ],
          [
            "Life beyond lectures",
            "Academic societies, cultural activities and sports can help you meet people and settle in. Ask what is available at your assigned campus.",
          ],
        ],
        ranks: "Globally ranked universities. Real choices to explore.",
        ranksBody:
          "Every institution below appears in our current offer list. Use rankings alongside subject fit, entry requirements and total costs.",
        rankSource:
          "QS World University Rankings 2027 · checked 10 November 2026",
        funding: "Know what your scholarship covers.",
        fundingBody:
          "A 100% tuition scholarship waives tuition. Accommodation, meals and other expenses need separate funding unless your award explicitly includes them.",
        awards: [
          [
            "Tuition scholarships",
            "Selected degree offers provide full or partial tuition waivers. The award may cover only the first year, with later funding subject to academic performance and review.",
          ],
          [
            "Housing and stipend options",
            "NJIT’s first-year awards and selected BNU Zhuhai awards include additional support. Amounts, payment months and renewal conditions differ by offer.",
          ],
          [
            "Chinese Government Scholarship",
            "Eligible full CSC awards can cover tuition, accommodation or a subsidy, a monthly stipend and medical insurance. This is a separate scholarship route, not a benefit attached to every program listed here.",
          ],
        ],
        routes: "Choose the intake that fits your next step.",
        spring: "March 2027",
        springBody:
          "Explore Chinese language and foundation courses, pathways to later degree study, and direct bachelor’s, master’s and PhD offers. Check the start date and progression requirements for each programme.",
        autumn: "September 2027",
        autumnBody:
          "Explore English- and Chinese-taught bachelor’s, master’s and doctoral offers. Check the subject list, scholarship deadlines, CSCA and language requirements.",
        browse: "Explore this intake",
        csca: "Check CSCA and language requirements before bachelor entry.",
        cscaBody:
          "A language or foundation place does not guarantee a bachelor place. Review the required CSCA subjects, test language, HSK and progression conditions on the individual offer.",
        support: "Start with your results and your budget.",
        supportBody:
          "Tell us about your education and study preferences. After reviewing your profile, a counsellor will contact you about suitable options, scholarship conditions, documents and the next steps.",
        faq: "Before you choose",
        questions: [
          [
            "Can I apply without IELTS?",
            "Some offers accept MOI or alternative proof. Others require IELTS, TOEFL, Duolingo or HSK. Check the requirements for your selected track rather than assuming one rule applies to every university.",
          ],
          [
            "Is a scholarship guaranteed?",
            "No. Selection depends on eligibility, assessment, available places and the university’s decision. Admission and scholarship awards may be decided separately.",
          ],
          [
            "Will I get a campus dormitory?",
            "Some offers include housing, some list paid dormitories, and others require off-campus accommodation. Places may be limited, so confirm the booking and actual charges.",
          ],
        ],
      };
  const icons = [GraduationCap, Landmark, Languages];
  const facilityIcons = [Microscope, Building2, BookOpen, GraduationCap];
  return (
    <>
      <section className="relative overflow-hidden bg-[#0b2038] py-12 text-white sm:py-20">
        <PageShell className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-orange-300">
              {c.eyebrow}
            </p>
            <h1 className="font-heading mt-5 max-w-2xl text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
              {c.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
              {c.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={explore}
                className="btn-sunset focus-ring inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-bold"
              >
                {c.explore}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={href("/consultation?destination=china")}
                className="focus-ring inline-flex min-h-12 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white hover:bg-white/10"
              >
                {c.assessment}
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-9 gap-y-4 border-t border-white/20 pt-6">
              {[
                [String(chinaOffers.length), c.offers],
                [String(chinaInstitutions.length), c.institutions],
                ["2", c.intakes],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-300">{label}</dt>
                  <dd className="mt-1 text-3xl font-semibold tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5">
            <Image
              src="/images/china-hust-campus.jpg"
              alt={
                bn
                  ? "Wuhan-এ HUST-এর সবুজ ক্যাম্পাস"
                  : "Green campus and academic buildings at HUST in Wuhan"
              }
              width={719}
              height={479}
              priority
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="px-5 py-4 text-xs leading-5 text-slate-200">
              {c.caption}
            </figcaption>
          </figure>
        </PageShell>
      </section>
      <section className="bg-white py-16 sm:py-20">
        <PageShell>
          <h2 className="font-heading max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {c.why}
          </h2>
          <p className="mt-4 max-w-2xl leading-8 text-slate-600">{c.whyBody}</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {c.reasons.map(([title, body], i) => {
              const Icon = icons[i] ?? GraduationCap;
              return (
                <div
                  key={title}
                  className="rounded-2xl border border-stone-200 p-6"
                >
                  <Icon aria-hidden="true" className="size-6 text-orange-600" />
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </PageShell>
      </section>
      <section className="bg-slate-50 py-16 sm:py-20">
        <PageShell>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {c.ranks}
          </h2>
          <p className="mt-4 max-w-2xl leading-8 text-slate-600">
            {c.ranksBody}
          </p>
          <p className="mt-4 text-xs text-slate-500">{c.rankSource}</p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chinaRankingExamples.map((u) => (
              <li
                key={u.id}
                className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5"
              >
                <p className="text-xs font-semibold text-slate-500">QS 2027</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  #{u.rank}
                </p>
                <h3 className="mt-3 leading-6 font-semibold text-slate-900">
                  {u.name}
                </h3>
                <Link
                  className="focus-ring mt-4 text-sm font-bold text-orange-700"
                  href={href(`/programs?country=china&university=${u.id}`)}
                >
                  {c.browse} →
                </Link>
                <a
                  href={u.url}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring mt-3 text-xs text-slate-500 underline"
                >
                  {bn ? "QS র‍্যাঙ্কিং দেখুন" : "View QS ranking"}
                </a>
              </li>
            ))}
          </ul>
        </PageShell>
      </section>
      <section className="bg-white py-16 sm:py-20">
        <PageShell className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold tracking-widest text-orange-700">
              {bn ? "ক্যাম্পাস জীবন" : "CAMPUS LIFE"}
            </p>
            <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {c.facilities}
            </h2>
            <p className="mt-4 leading-8 text-slate-600">{c.facilitiesBody}</p>
            <a
              href="https://iso.hust.edu.cn/Services_Information/Campus_Facilities/Housing___Dining.htm"
              className="focus-ring mt-5 inline-flex text-xs text-slate-500 underline"
              target="_blank"
              rel="noreferrer"
            >
              {bn
                ? "HUST-এর ক্যাম্পাস সুবিধা"
                : "Explore HUST’s campus facilities"}
            </a>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {c.facilityCards.map(([title, body], i) => {
              const Icon = facilityIcons[i] ?? Building2;
              return (
                <div key={title}>
                  <Icon className="size-5 text-slate-700" aria-hidden="true" />
                  <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </PageShell>
      </section>
      <section className="bg-[#edf4f1] py-16 sm:py-20">
        <PageShell>
          <h2 className="font-heading max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {c.funding}
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-slate-700">
            {c.fundingBody}
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {c.awards.map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl border border-emerald-900/10 bg-white p-6"
              >
                <h3 className="text-xl font-semibold text-emerald-950">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
          <Link
            href={href("/programs?country=china&scholarship=1")}
            className="focus-ring mt-7 inline-flex min-h-11 items-center font-bold text-emerald-900"
          >
            {bn
              ? "স্কলারশিপের সুযোগসহ অফার দেখুন"
              : "Explore offers with scholarship opportunities"}{" "}
            →
          </Link>
          <p className="mt-3 text-xs leading-6 text-slate-600">
            {bn ? "CSC-এর সাধারণ তথ্য:" : "General CSC information:"}{" "}
            <a
              className="focus-ring underline"
              href="https://www.campuschina.org/"
              target="_blank"
              rel="noreferrer"
            >
              Campus China
            </a>{" "}
            ·{" "}
            <a
              className="focus-ring underline"
              href="https://english.shanghai.gov.cn/en-Individuals-HigherEducation-Scholarships/20260813/305c553a1e5946929d81b3715bff50e0.html"
              target="_blank"
              rel="noreferrer"
            >
              {bn ? "স্কলারশিপের কভারেজ" : "Scholarship coverage"}
            </a>
          </p>
        </PageShell>
      </section>
      <section className="bg-white py-16 sm:py-20">
        <PageShell>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {c.routes}
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              [c.spring, c.springBody],
              [c.autumn, c.autumnBody],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-3xl border border-stone-200 bg-slate-50 p-7"
              >
                <h3 className="text-2xl font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
                <Link
                  href={href(
                    `/programs?country=china&intake=${encodeURIComponent(title ?? "")}`,
                  )}
                  className="btn-sunset focus-ring mt-6 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold"
                >
                  {c.browse} →
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-stone-200 p-6">
            <h3 className="font-semibold text-slate-900">{c.csca}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {c.cscaBody}
            </p>
          </div>
        </PageShell>
      </section>
      <section className="bg-slate-50 py-16">
        <PageShell className="max-w-4xl">
          <h2 className="font-heading text-3xl font-semibold text-slate-900">
            {c.faq}
          </h2>
          <div className="mt-6 divide-y divide-stone-200">
            {c.questions.map(([q, a]) => (
              <details key={q} className="py-5">
                <summary className="focus-ring cursor-pointer text-lg font-semibold text-slate-900">
                  {q}
                </summary>
                <p className="mt-3 leading-8 text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </PageShell>
      </section>
      <section className="bg-[#0b2038] py-16 text-white">
        <PageShell>
          <h2 className="font-heading max-w-3xl text-3xl font-semibold sm:text-4xl">
            {c.support}
          </h2>
          <p className="mt-5 max-w-2xl leading-8 text-slate-200">
            {c.supportBody}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={href("/consultation?destination=china")}
              className="btn-sunset focus-ring inline-flex min-h-12 items-center rounded-full px-6 text-sm font-bold"
            >
              {c.assessment}
            </Link>
            <Link
              href={explore}
              className="focus-ring inline-flex min-h-12 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white hover:bg-white/10"
            >
              {c.explore}
            </Link>
          </div>
        </PageShell>
      </section>
    </>
  );
}
