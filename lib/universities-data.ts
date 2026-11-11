import type { DestinationSlug } from "@/lib/destinations";

export type FeaturedUniversity = {
  id: string;
  name: string;
  country: DestinationSlug;
  countryLabel: {
    en: string;
    bn: string;
  };
  city: {
    en: string;
    bn: string;
  };
  rankingBadge: {
    en: string;
    bn: string;
  };
  has100PercentScholarship: boolean;
  scholarshipInfo: {
    en: string;
    bn: string;
  };
  popularMajors: {
    en: string[];
    bn: string[];
  };
  tuitionEst: {
    en: string;
    bn: string;
  };
  programsHrefCountry: string;
};

export const FEATURED_UNIVERSITIES: FeaturedUniversity[] = [
  // =========================================================================
  // MALAYSIA
  // =========================================================================
  {
    id: "um",
    name: "Universiti Malaya (UM)",
    country: "malaysia",
    countryLabel: { en: "Malaysia", bn: "মালয়েশিয়া" },
    city: { en: "Kuala Lumpur", bn: "কুয়ালালামপুর" },
    rankingBadge: { en: "QS #60 Global", bn: "কিউএস #৬০ বিশ্ব র‍্যাংক" },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "MIS & University Merit Grants",
      bn: "এমআইএস ও বিশ্ববিদ্যালয় মেধা অনুদান",
    },
    popularMajors: {
      en: ["Computer Science & AI", "Software Engineering", "Business Admin"],
      bn: ["কম্পিউটার সায়েন্স ও এআই", "সফটওয়্যার ইঞ্জিনিয়ারিং", "বিবিএ"],
    },
    tuitionEst: { en: "~25,000 MYR/yr", bn: "~২৫,০০০ রিঙ্গিত/বছর" },
    programsHrefCountry: "malaysia",
  },
  {
    id: "upm",
    name: "Universiti Putra Malaysia (UPM)",
    country: "malaysia",
    countryLabel: { en: "Malaysia", bn: "মালয়েশিয়া" },
    city: { en: "Serdang, Selangor", bn: "সেরদাং, সেলাঙ্গর" },
    rankingBadge: { en: "Top 150 Global", bn: "শীর্ষ ১৫০ বিশ্ব র‍্যাংক" },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "Faculty Merit Fee Reductions",
      bn: "অনুষদভিত্তিক মেধা টিউশন ছাড়",
    },
    popularMajors: {
      en: ["Information Technology", "Agricultural Science", "MBA"],
      bn: ["ইনফরমেশন টেকনোলজি", "এগ্রিকালচারাল সায়েন্স", "এমবিএ"],
    },
    tuitionEst: { en: "~22,000 MYR/yr", bn: "~২২,০০০ রিঙ্গিত/বছর" },
    programsHrefCountry: "malaysia",
  },
  {
    id: "taylors",
    name: "Taylor's University",
    country: "malaysia",
    countryLabel: { en: "Malaysia", bn: "মালয়েশিয়া" },
    city: { en: "Subang Jaya", bn: "সুবাং জয়া" },
    rankingBadge: {
      en: "#1 Private in SE Asia",
      bn: "#১ প্রাইভেট (দক্ষিণ-পূর্ব এশিয়া)",
    },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "Merit & High-Achiever Scholarships",
      bn: "মেধা ও উচ্চ ফলাফল ভিত্তিক বৃত্তি",
    },
    popularMajors: {
      en: ["Hospitality & Tourism", "Business & Finance", "Computer Science"],
      bn: ["হসপিটালিটি ও ট্যুরিজম", "বিজনেস ও ফিন্যান্স", "কম্পিউটার সায়েন্স"],
    },
    tuitionEst: { en: "~38,000 MYR/yr", bn: "~৩৮,০০০ রিঙ্গিত/বছর" },
    programsHrefCountry: "malaysia",
  },
  {
    id: "apu",
    name: "Asia Pacific University (APU)",
    country: "malaysia",
    countryLabel: { en: "Malaysia", bn: "মালয়েশিয়া" },
    city: { en: "Technology Park, KL", bn: "টেকনোলজি পার্ক, কুয়ালালামপুর" },
    rankingBadge: { en: "QS 5-Stars Plus", bn: "কিউএস ৫-স্টার প্লাস" },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "Digital Tech Excellence Awards",
      bn: "ডিজিটাল টেক এক্সিলেন্স বৃত্তি",
    },
    popularMajors: {
      en: ["Cybersecurity", "Data Analytics", "Software Engineering"],
      bn: [
        "সাইবার সিকিউরিটি",
        "ডাটা অ্যানালিটিক্স",
        "সফটওয়্যার ইঞ্জিনিয়ারিং",
      ],
    },
    tuitionEst: { en: "~32,000 MYR/yr", bn: "~৩২,০০০ রিঙ্গিত/বছর" },
    programsHrefCountry: "malaysia",
  },
  {
    id: "sunway",
    name: "Sunway University",
    country: "malaysia",
    countryLabel: { en: "Malaysia", bn: "মালয়েশিয়া" },
    city: { en: "Bandar Sunway", bn: "বান্দার সানওয়ে" },
    rankingBadge: {
      en: "Dual Lancaster (UK) Degree",
      bn: "ল্যাঙ্কাস্টার (যুক্তরাজ্য) দ্বৈত ডিগ্রি",
    },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "Jeffrey Cheah Foundation Scholarships",
      bn: "জেফরি চিয়া ফাউন্ডেশন মেধা বৃত্তি",
    },
    popularMajors: {
      en: ["Accounting & Finance", "Computer Science", "Biomedicine"],
      bn: ["অ্যাকাউন্টিং ও ফিন্যান্স", "কম্পিউটার সায়েন্স", "বায়োমেডিসিন"],
    },
    tuitionEst: { en: "~35,000 MYR/yr", bn: "~৩৫,০০০ রিঙ্গিত/বছর" },
    programsHrefCountry: "malaysia",
  },

  // =========================================================================
  // CHINA
  // =========================================================================
  {
    id: "zju",
    name: "Zhejiang University (ZJU)",
    country: "china",
    countryLabel: { en: "China", bn: "চীন" },
    city: { en: "Hangzhou", bn: "হাংচৌ" },
    rankingBadge: {
      en: "Research university · Hangzhou",
      bn: "গবেষণা বিশ্ববিদ্যালয় · হাংচৌ",
    },
    has100PercentScholarship: true,
    scholarshipInfo: {
      en: "Competitive scholarships; undergraduate CSC Type A is for Chinese-taught programs. English-taught awards have separate terms.",
      bn: "প্রতিযোগিতামূলক স্কলারশিপ; স্নাতকের CSC Type A চীনা মাধ্যমের জন্য। ইংরেজি মাধ্যমের বৃত্তির শর্ত আলাদা।",
    },
    popularMajors: {
      en: [
        "Computer Science & AI",
        "Mechanical Engineering",
        "Global Business",
      ],
      bn: [
        "কম্পিউটার সায়েন্স ও এআই",
        "মেকানিক্যাল ইঞ্জিনিয়ারিং",
        "গ্লোবাল বিজনেস",
      ],
    },
    tuitionEst: {
      en: "Program-specific fees; confirm your offer",
      bn: "প্রোগ্রাম অনুযায়ী ফি; অফার মিলিয়ে নিন",
    },
    programsHrefCountry: "china",
  },
  {
    id: "nmu",
    name: "Nanjing Medical University",
    country: "china",
    countryLabel: { en: "China", bn: "চীন" },
    city: { en: "Nanjing", bn: "নানচিং" },
    rankingBadge: {
      en: "English-taught MBBS · 6 years",
      bn: "ইংরেজি মাধ্যমে এমবিবিএস · ৬ বছর",
    },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "University and government awards are competitive. Check current award terms and BMDC eligibility for your intake.",
      bn: "বিশ্ববিদ্যালয় ও সরকারি বৃত্তি প্রতিযোগিতামূলক। বর্তমান শর্ত ও আপনার ইনটেকের BMDC যোগ্যতা যাচাই করুন।",
    },
    popularMajors: {
      en: ["Clinical Medicine (MBBS)", "Stomatology", "Pharmacy"],
      bn: ["ক্লিনিক্যাল মেডিসিন (এমবিবিএস)", "স্টোমাটোলজি", "ফার্মেসি"],
    },
    tuitionEst: { en: "~34,000 CNY/yr", bn: "~৩৪,০০০ ইউয়ান/বছর" },
    programsHrefCountry: "china",
  },
  {
    id: "hit",
    name: "Harbin Institute of Technology (HIT)",
    country: "china",
    countryLabel: { en: "China", bn: "চীন" },
    city: { en: "Harbin", bn: "হারবিন" },
    rankingBadge: {
      en: "Engineering & technology",
      bn: "ইঞ্জিনিয়ারিং ও প্রযুক্তি",
    },
    has100PercentScholarship: true,
    scholarshipInfo: {
      en: "CSC Type A and competitive HIT tuition awards. Check the current major list, teaching language and scholarship deadline.",
      bn: "CSC Type A ও প্রতিযোগিতামূলক HIT টিউশন বৃত্তি। বর্তমান বিষয়ের তালিকা, পাঠদানের ভাষা ও বৃত্তির সময়সীমা দেখুন।",
    },
    popularMajors: {
      en: ["Robotics & Automation", "Civil Engineering", "Aerospace"],
      bn: ["রোবোটিক্স ও অটোমেশন", "সিভিল ইঞ্জিনিয়ারিং", "এরোস্পেস"],
    },
    tuitionEst: {
      en: "20,000–26,000 CNY/yr · by language",
      bn: "২০,০০০–২৬,০০০ ইউয়ান/বছর · ভাষা অনুযায়ী",
    },
    programsHrefCountry: "china",
  },
  {
    id: "wut",
    name: "Wuhan University of Technology",
    country: "china",
    countryLabel: { en: "China", bn: "চীন" },
    city: { en: "Wuhan", bn: "উহান" },
    rankingBadge: { en: "Double First-Class", bn: "ডাবল ফার্স্ট-ক্লাস জাতীয়" },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "Confirm the current scholarship call, teaching language and program-specific tuition with the university.",
      bn: "বিশ্ববিদ্যালয়ের বর্তমান স্কলারশিপ বিজ্ঞপ্তি, পাঠদানের ভাষা ও নির্দিষ্ট প্রোগ্রামের ফি নিশ্চিত করুন।",
    },
    popularMajors: {
      en: ["Materials Science", "Automotive Engineering", "Computer Science"],
      bn: [
        "ম্যাটেরিয়ালস সায়েন্স",
        "অটোমোটিভ ইঞ্জিনিয়ারিং",
        "কম্পিউটার সায়েন্স",
      ],
    },
    tuitionEst: {
      en: "Confirm current program fees",
      bn: "বর্তমান প্রোগ্রামের ফি নিশ্চিত করুন",
    },
    programsHrefCountry: "china",
  },

  {
    id: "nenu",
    name: "Northeast Normal University (NENU)",
    country: "china",
    countryLabel: { en: "China", bn: "চীন" },
    city: { en: "Changchun", bn: "চাংচুন" },
    rankingBadge: {
      en: "Chinese language study",
      bn: "চীনা ভাষা শিক্ষা",
    },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "Language study and degree scholarships have separate applications. Course completion does not guarantee degree admission or funding.",
      bn: "ভাষা শিক্ষা ও ডিগ্রি বৃত্তির আবেদন আলাদা। কোর্স শেষ করলেই ডিগ্রিতে ভর্তি বা বৃত্তি নিশ্চিত হয় না।",
    },
    popularMajors: {
      en: ["Chinese language", "Language preparation"],
      bn: ["চীনা ভাষা", "ভাষার প্রস্তুতি"],
    },
    tuitionEst: {
      en: "Confirm current language-course fees",
      bn: "ভাষা কোর্সের বর্তমান ফি নিশ্চিত করুন",
    },
    programsHrefCountry: "china",
  },

  // =========================================================================
  // SOUTH KOREA
  // =========================================================================
  {
    id: "snu",
    name: "Seoul National University",
    country: "south-korea",
    countryLabel: { en: "South Korea", bn: "দক্ষিণ কোরিয়া" },
    city: { en: "Seoul", bn: "সিউল" },
    rankingBadge: {
      en: "QS #31 Global · #1 Korea",
      bn: "কিউএস #৩১ · কোরিয়ার #১ বিশ্ববিদ্যালয়",
    },
    has100PercentScholarship: true,
    scholarshipInfo: {
      en: "100% Global Korea Scholarship (GKS Full Ride)",
      bn: "১০০% জিকেএস সম্পূর্ণ সরকারি অনুদান ও ভাতা",
    },
    popularMajors: {
      en: [
        "Computer Science & AI",
        "Business Administration",
        "Korean Studies",
      ],
      bn: [
        "কম্পিউটার সায়েন্স ও এআই",
        "বিজনেস অ্যাডমিনিস্ট্রেশন",
        "কোরিয়ান স্টাডিজ",
      ],
    },
    tuitionEst: {
      en: "100% Free with GKS",
      bn: "জিকেএস বৃত্তিতে সম্পূর্ণ ফ্রি",
    },
    programsHrefCountry: "south_korea",
  },
  {
    id: "kaist",
    name: "KAIST",
    country: "south-korea",
    countryLabel: { en: "South Korea", bn: "দক্ষিণ কোরিয়া" },
    city: { en: "Daejeon", bn: "দেজন" },
    rankingBadge: {
      en: "QS #56 Global · STEM Titan",
      bn: "কিউএস #৫৬ · গ্লোবাল স্টেম টাইটান",
    },
    has100PercentScholarship: true,
    scholarshipInfo: {
      en: "100% Tuition Waiver + Monthly Living Stipend",
      bn: "১০০% টিউশন ওয়েভার + মাসিক থাকা-খাওয়ার ভাতা",
    },
    popularMajors: {
      en: ["Electrical Engineering", "Computer Science", "Robotics"],
      bn: ["ইলেকট্রিক্যাল ইঞ্জিনিয়ারিং", "কম্পিউটার সায়েন্স", "রোবোটিক্স"],
    },
    tuitionEst: {
      en: "100% Scholarship Covered",
      bn: "১০০% সম্পূর্ণ বৃত্তির আওতাভুক্ত",
    },
    programsHrefCountry: "south_korea",
  },
  {
    id: "yonsei",
    name: "Yonsei University",
    country: "south-korea",
    countryLabel: { en: "South Korea", bn: "দক্ষিণ কোরিয়া" },
    city: { en: "Seoul / Songdo", bn: "সিউল / সংদো" },
    rankingBadge: {
      en: "QS #76 · SKY League",
      bn: "কিউএস #৭৬ · স্কাই (SKY) লীগ",
    },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "Underwood International College (UIC) Grants",
      bn: "আন্ডারউড ইন্টারন্যাশনাল কলেজ অনুদান",
    },
    popularMajors: {
      en: ["Global Economics", "Bio-Convergence", "Media & Communication"],
      bn: ["গ্লোবাল ইকোনমিক্স", "বায়ো-কনভারজেন্স", "মিডিয়া ও কমিউনিকেশন"],
    },
    tuitionEst: { en: "~5,500 USD/sem", bn: "~৫,৫০০ ডলার/সেমিস্টার" },
    programsHrefCountry: "south_korea",
  },

  // =========================================================================
  // INDIA
  // =========================================================================
  {
    id: "vit",
    name: "Vellore Institute of Technology (VIT)",
    country: "india",
    countryLabel: { en: "India", bn: "ভারত" },
    city: { en: "Vellore / Chennai", bn: "ভেলোর / চেন্নাই" },
    rankingBadge: {
      en: "NAAC A++ Accredited",
      bn: "ন্যাক (NAAC) এ++ অ্যাক্রেডিটেড",
    },
    has100PercentScholarship: true,
    scholarshipInfo: {
      en: "100% Study in India (SII) Tuition Waivers",
      bn: "১০০% স্টাডি ইন ইন্ডিয়া (SII) টিউশন ওয়েভার",
    },
    popularMajors: {
      en: ["B.Tech Computer Science", "Data Science", "Biotechnology"],
      bn: ["বি.টেক কম্পিউটার সায়েন্স", "ডাটা সায়েন্স", "বায়োটেকনোলজি"],
    },
    tuitionEst: {
      en: "100% Waiver Seats / ~2.5 Lakh INR",
      bn: "১০০% ওয়েভার / ~২.৫ লাখ রুপি",
    },
    programsHrefCountry: "india",
  },
  {
    id: "mahe",
    name: "Manipal Academy of Higher Education (MAHE)",
    country: "india",
    countryLabel: { en: "India", bn: "ভারত" },
    city: { en: "Manipal / Bengaluru", bn: "মনিপাল / বেঙ্গালুরু" },
    rankingBadge: {
      en: "Institution of Eminence",
      bn: "ইনস্টিটিউশন অব এমিনেন্স (IoE)",
    },
    has100PercentScholarship: false,
    scholarshipInfo: {
      en: "Study in India (SII) Merit Grants",
      bn: "স্টাডি ইন ইন্ডিয়া (SII) মেধা অনুদান",
    },
    popularMajors: {
      en: ["Health Sciences", "Information Technology", "Business Admin"],
      bn: ["হেলথ সায়েন্সেস", "ইনফরমেশন টেকনোলজি", "বিজনেস অ্যাডমিন"],
    },
    tuitionEst: { en: "~2.8 - 4.0 Lakh INR/yr", bn: "~২.৮ - ৪.০ লাখ রুপি/বছর" },
    programsHrefCountry: "india",
  },
];
