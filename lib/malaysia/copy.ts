import type { Locale } from "@/lib/i18n/config";
export function malaysiaCopy(locale: Locale) {
  const bn = locale === "bn";
  return {
    title: bn
      ? "মালয়েশিয়ার বিশ্ববিদ্যালয় ও অফার"
      : "Malaysia universities & offers",
    explore: bn
      ? "মালয়েশিয়ার বিশ্ববিদ্যালয় ও অফার দেখুন"
      : "Explore Malaysia Universities & Offers",
    intro: bn
      ? "প্রতিষ্ঠান বেছে নিয়ে প্রোগ্রাম, ক্যাম্পাস ও প্রকাশিত ফি দেখুন। প্রতিটি সময়সূচির মেয়াদ ও যোগ্যতার শর্ত আলাদা।"
      : "Choose an institution to explore programmes, campuses and published fees. Each schedule has its own period and eligibility conditions.",
    dated: bn
      ? "এগুলো তারিখযুক্ত প্রকাশিত ফি। বর্তমান ফি, ইনটেক ও বৃত্তির প্রাপ্যতা আবেদনের আগে নিশ্চিত করুন।"
      : "These are dated published schedules. Confirm current fees, intakes and scholarship availability before applying.",
    search: bn
      ? "নাম, বিষয় বা ক্যাম্পাস খুঁজুন"
      : "Search name, subject or campus",
    level: bn ? "শিক্ষার স্তর" : "Study level",
    mode: bn ? "পড়ার ধরন" : "Study mode",
    intake: bn ? "প্রকাশিত ইনটেক" : "Published intake",
    all: bn ? "সব" : "All",
    apply: bn ? "খুঁজুন" : "Search",
    reset: bn ? "ফিল্টার মুছুন" : "Clear filters",
    empty: bn
      ? "এই ফিল্টারে কোনো ফল পাওয়া যায়নি।"
      : "No results match these filters.",
    programmes: bn ? "প্রোগ্রাম" : "Programmes",
    fees: bn ? "ফি ও শর্ত দেখুন" : "View fees & conditions",
    assessment: bn
      ? "বিনামূল্যে প্রোফাইল মূল্যায়ন"
      : "Free Profile Assessment",
    schools: bn
      ? "আন্তর্জাতিক স্কুল ও AUSMAT"
      : "International schools & AUSMAT",
    reference: bn ? "অফিসিয়াল ফি রেফারেন্স" : "Official fee reference",
    back: bn ? "মালয়েশিয়ার সব প্রতিষ্ঠান" : "All Malaysia institutions",
    historical: bn ? "আগের প্রকাশিত ফি" : "Historical schedule",
    confirmation: bn
      ? "বর্তমান প্রাপ্যতা নিশ্চিত করুন"
      : "Current availability to confirm",
    schedules: bn ? "প্রকাশিত ফি সময়সূচি" : "Published fee schedules",
    conditions: bn
      ? "যোগ্যতা, পেমেন্ট ও অন্যান্য শর্ত"
      : "Eligibility, payment & other conditions",
    unknown: bn
      ? "সূত্রে উল্লেখ নেই — নিশ্চিত করুন"
      : "Not specified in source — confirm",
    source: bn ? "প্রকাশিত সূত্র" : "Published source",
    note: bn
      ? "মূল প্রোগ্রামের নাম, ফি ও শর্ত ইংরেজিতে রাখা হয়েছে। ফাঁকা তথ্য অজানা; ড্যাশকে শূন্য ধরা হয়নি।"
      : "Printed programme names, fees and conditions are retained in English. Missing information is unknown; a dash is not treated as zero.",
    basis: bn
      ? "বার্ষিক, সেমিস্টার ও সম্পূর্ণ প্রোগ্রামের ফি আলাদা ভিত্তিতে দেওয়া। কোনো মুদ্রা রূপান্তর করা হয়নি।"
      : "Annual, semester and whole-programme amounts have distinct bases. No currency conversion has been applied.",
    previous: bn ? "আগের পৃষ্ঠা" : "Previous",
    next: bn ? "পরের পৃষ্ঠা" : "Next",
    page: bn ? "পৃষ্ঠা" : "Page",
    results: bn ? "ফলাফল" : "results",
    provider: bn ? "প্রদানকারী / পার্টনার" : "Provider / partner",
    campus: bn ? "ক্যাম্পাস" : "Campus",
    duration: bn ? "মেয়াদ" : "Duration",
    code: bn ? "প্রোগ্রাম কোড" : "Programme code",
    compare: bn ? "তুলনার জন্য বাছুন" : "Select for comparison",
    compareNow: bn
      ? "বাছাই করা প্রোগ্রাম তুলনা করুন"
      : "Compare selected programmes",
    compareLimit: bn
      ? "সর্বোচ্চ ৩টি প্রোগ্রাম তুলনা করুন।"
      : "Compare up to 3 programmes.",
  };
}
export function malaysiaLevelLabel(level: string, locale: Locale) {
  const labels: Record<string, [string, string]> = {
    graduate_certificate: ["Graduate certificate", "গ্র্যাজুয়েট সার্টিফিকেট"],
    postgraduate_certificate: [
      "Postgraduate certificate",
      "পোস্টগ্র্যাজুয়েট সার্টিফিকেট",
    ],
    postgraduate_diploma: [
      "Postgraduate diploma",
      "পোস্টগ্র্যাজুয়েট ডিপ্লোমা",
    ],
    degree_transfer: ["Degree transfer", "ডিগ্রি ট্রান্সফার"],
    master_phd: ["MPhil / PhD pathway", "এমফিল / পিএইচডি পথ"],
    foundation: [
      "Foundation / pre-university",
      "ফাউন্ডেশন / প্রি-ইউনিভার্সিটি",
    ],
    diploma: ["Diploma", "ডিপ্লোমা"],
    bachelor: ["Bachelor’s", "স্নাতক"],
    master: ["Master’s", "মাস্টার্স"],
    phd: ["PhD / doctorate", "পিএইচডি / ডক্টরেট"],
    language: ["English / language", "ইংরেজি / ভাষা"],
    certificate: ["Certificate", "সার্টিফিকেট"],
    graduate_diploma: ["Graduate diploma", "গ্র্যাজুয়েট ডিপ্লোমা"],
    school: ["School", "স্কুল"],
    ausmat: ["AUSMAT", "AUSMAT"],
    other: ["Other", "অন্যান্য"],
  };
  return labels[level]?.[locale === "bn" ? 1 : 0] ?? level;
}
