import type { ProgramCountry, ProgramLevel } from "@/db/schema";
import type { Locale } from "@/lib/i18n/config";
import type { PublicProgramDetail } from "@/lib/programs-public";

const countryCode: Record<ProgramCountry, string> = {
  china: "CN",
  india: "IN",
  malaysia: "MY",
  south_korea: "KR",
};

const levelEn: Record<ProgramLevel, string> = {
  bachelor: "bachelor",
  master: "master",
  phd: "PhD",
  language: "language",
  diploma: "diploma",
};

const levelBn: Record<ProgramLevel, string> = {
  bachelor: "স্নাতক",
  master: "স্নাতকোত্তর",
  phd: "পিএইচডি",
  language: "ভাষা",
  diploma: "ডিপ্লোমা",
};

const educationalLevel: Record<ProgramLevel, string> = {
  bachelor: "Bachelor's degree",
  master: "Master's degree",
  phd: "Doctoral degree",
  language: "Language program",
  diploma: "Diploma",
};

export type ProgramSeoCopy = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  courseName: string;
  courseDescription: string;
  countryCode: string;
  educationalLevel: string;
};

/**
 * Finished sentences per destination — not one template with the
 * university name dropped in. Facts (field, university, tuition)
 * still appear because each listing is a different program.
 */
export function programSeoCopy(
  program: PublicProgramDetail,
  locale: Locale,
): ProgramSeoCopy {
  const code = countryCode[program.country];
  const tuition = `${program.tuitionAmount} ${program.tuitionCurrency}`;

  if (locale === "bn") {
    return programSeoCopyBn(program, code, tuition);
  }

  return programSeoCopyEn(program, code, tuition);
}

function programSeoCopyEn(
  program: PublicProgramDetail,
  code: string,
  tuition: string,
): ProgramSeoCopy {
  const level = levelEn[program.level];
  const courseName = `${educationalLevel[program.level]} in ${program.field}`;

  switch (program.country) {
    case "china":
      return {
        title: `${program.field} in China — ${program.universityName}`,
        description: `A ${level} ${program.field} listing at ${program.universityName} for students applying from Bangladesh. Tuition is posted as ${tuition}. The usual visa file is X1 or X2, built on the admission letter and JW201/JW202.`,
        ogTitle: `${program.universityName} teaches ${program.field} in China`,
        ogDescription: `China route: ${program.field} at ${program.universityName}, ${tuition}. X1/X2 — not a generic invitation letter.`,
        courseName,
        courseDescription: `${courseName} offered by ${program.universityName} in China. Listed for Bangladeshi applicants. Published tuition ${tuition}. The admission letter and JW201 or JW202 come before the X1 or X2 visa interview.`,
        countryCode: code,
        educationalLevel: educationalLevel[program.level],
      };
    case "india":
      return {
        title: `${program.field} in India — ${program.universityName}`,
        description: `A ${level} ${program.field} listing at ${program.universityName} for students applying from Bangladesh. Tuition is posted as ${tuition}. Study in India (SII) registration and the SII-ID come before the e-Student visa.`,
        ogTitle: `${program.universityName} on the India (SII) route`,
        ogDescription: `${program.field} at ${program.universityName}, ${tuition}. The portal is first — SII-ID, then the e-Student visa.`,
        courseName,
        courseDescription: `${courseName} offered by ${program.universityName} in India. Listed for Bangladeshi applicants. Published tuition ${tuition}. Mandatory Study in India registration produces the SII-ID used for the e-Student visa.`,
        countryCode: code,
        educationalLevel: educationalLevel[program.level],
      };
    case "malaysia":
      return {
        title: `${program.field} in Malaysia — ${program.universityName}`,
        description: `A ${level} ${program.field} listing at ${program.universityName} for students applying from Bangladesh. Tuition is posted as ${tuition}. The Student Pass runs through EMGS; the applicant should be outside Malaysia when the eVISA is filed.`,
        ogTitle: `${program.universityName} · Malaysia (EMGS)`,
        ogDescription: `${program.field} at ${program.universityName}, ${tuition}. EMGS Approval to Study, then eVISA from outside Malaysia.`,
        courseName,
        courseDescription: `${courseName} offered by ${program.universityName} in Malaysia. Listed for Bangladeshi applicants. Published tuition ${tuition}. The Student Pass is processed by EMGS; the Single Entry Visa is requested while the student is still outside Malaysia.`,
        countryCode: code,
        educationalLevel: educationalLevel[program.level],
      };
    case "south_korea":
      return {
        title: `${program.field} in South Korea — ${program.universityName}`,
        description: `A ${level} ${program.field} listing at ${program.universityName} for students applying from Bangladesh. Tuition is posted as ${tuition}. Degree study uses D-2; language or non-degree study uses D-4 — those are not the same visa.`,
        ogTitle: `${program.universityName} · South Korea (D-2 / D-4)`,
        ogDescription: `${program.field} at ${program.universityName}, ${tuition}. Confirm D-2 versus D-4 before anyone files.`,
        courseName,
        courseDescription: `${courseName} offered by ${program.universityName} in South Korea. Listed for Bangladeshi applicants. Published tuition ${tuition}. D-2 covers degree programs; D-4 covers language and other non-degree study.`,
        countryCode: code,
        educationalLevel: educationalLevel[program.level],
      };
  }
}

function programSeoCopyBn(
  program: PublicProgramDetail,
  code: string,
  tuition: string,
): ProgramSeoCopy {
  const level = levelBn[program.level];
  const courseName = `${level} · ${program.field}`;

  switch (program.country) {
    case "china":
      return {
        title: `চীনে ${program.field} — ${program.universityName}`,
        description: `বাংলাদেশ থেকে আবেদনের জন্য ${program.universityName}-এ ${level} ${program.field} তালিকা। টিউশন ${tuition} হিসেবে দেওয়া। সাধারণ ভিসা ফাইল X1 বা X2 — ভর্তিপত্র ও JW201/JW202-এর উপর।`,
        ogTitle: `${program.universityName} চীনে ${program.field} পড়ায়`,
        ogDescription: `ঢাকার ডেস্ক থেকে চীন পথ: ${program.universityName}-এ ${program.field}, ${tuition}। X1/X2 — সাধারণ আমন্ত্রণপত্র নয়।`,
        courseName,
        courseDescription: `${program.universityName} চীনে ${courseName} অফার করে। বাংলাদেশি আবেদনকারীদের জন্য তালিকাভুক্ত। প্রকাশিত টিউশন ${tuition}। X1 বা X2 সাক্ষাৎকারের আগে ভর্তিপত্র ও JW201 অথবা JW202 লাগে।`,
        countryCode: code,
        educationalLevel: educationalLevel[program.level],
      };
    case "india":
      return {
        title: `ভারতে ${program.field} — ${program.universityName}`,
        description: `বাংলাদেশ থেকে আবেদনের জন্য ${program.universityName}-এ ${level} ${program.field} তালিকা। টিউশন ${tuition} হিসেবে দেওয়া। ই-স্টুডেন্ট ভিসার আগে Study in India (SII) নিবন্ধন ও SII-ID।`,
        ogTitle: `${program.universityName} · ভারত (SII) পথ`,
        ogDescription: `${program.universityName}-এ ${program.field}, ${tuition}। আগে পোর্টাল — SII-ID, তারপর ই-স্টুডেন্ট ভিসা।`,
        courseName,
        courseDescription: `${program.universityName} ভারতে ${courseName} অফার করে। বাংলাদেশি আবেদনকারীদের জন্য তালিকাভুক্ত। প্রকাশিত টিউশন ${tuition}। বাধ্যতামূলক SII নিবন্ধন থেকে যে SII-ID আসে, ই-স্টুডেন্ট ভিসায় সেটি লাগে।`,
        countryCode: code,
        educationalLevel: educationalLevel[program.level],
      };
    case "malaysia":
      return {
        title: `মালয়েশিয়ায় ${program.field} — ${program.universityName}`,
        description: `বাংলাদেশ থেকে আবেদনের জন্য ${program.universityName}-এ ${level} ${program.field} তালিকা। টিউশন ${tuition} হিসেবে দেওয়া। স্টুডেন্ট পাস EMGS দিয়ে যায়; ই-ভিসা দাখিলের সময় আবেদনকারী মালয়েশিয়ার বাইরে থাকবেন।`,
        ogTitle: `${program.universityName} · মালয়েশিয়া (EMGS)`,
        ogDescription: `${program.universityName}-এ ${program.field}, ${tuition}। EMGS Approval to Study, তারপর মালয়েশিয়ার বাইরে থেকে ই-ভিসা।`,
        courseName,
        courseDescription: `${program.universityName} মালয়েশিয়ায় ${courseName} অফার করে। বাংলাদেশি আবেদনকারীদের জন্য তালিকাভুক্ত। প্রকাশিত টিউশন ${tuition}। স্টুডেন্ট পাস EMGS প্রক্রিয়া করে; সিঙ্গেল এন্ট্রি ভিসা শিক্ষার্থী এখনো দেশের বাইরে থাকতেই চাওয়া হয়।`,
        countryCode: code,
        educationalLevel: educationalLevel[program.level],
      };
    case "south_korea":
      return {
        title: `দক্ষিণ কোরিয়ায় ${program.field} — ${program.universityName}`,
        description: `বাংলাদেশ থেকে আবেদনের জন্য ${program.universityName}-এ ${level} ${program.field} তালিকা। টিউশন ${tuition} হিসেবে দেওয়া। ডিগ্রিতে D-2; ভাষা বা নন-ডিগ্রিতে D-4 — এক ভিসা নয়।`,
        ogTitle: `${program.universityName} · দক্ষিণ কোরিয়া (D-2 / D-4)`,
        ogDescription: `${program.universityName}-এ ${program.field}, ${tuition}। ফাইলের আগে D-2 না D-4, তা নিশ্চিত করুন।`,
        courseName,
        courseDescription: `${program.universityName} দক্ষিণ কোরিয়ায় ${courseName} অফার করে। বাংলাদেশি আবেদনকারীদের জন্য তালিকাভুক্ত। প্রকাশিত টিউশন ${tuition}। D-2 ডিগ্রি প্রোগ্রামের জন্য; D-4 ভাষা ও অন্য নন-ডিগ্রি পড়ার জন্য।`,
        countryCode: code,
        educationalLevel: educationalLevel[program.level],
      };
  }
}

export function programCourseJsonLd(
  program: PublicProgramDetail,
  copy: ProgramSeoCopy,
  pageUrl: string,
) {
  const providerId = `${pageUrl}#provider`;
  const courseId = `${pageUrl}#course`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": providerId,
        name: program.universityName,
        address: {
          "@type": "PostalAddress",
          addressCountry: copy.countryCode,
        },
      },
      {
        "@type": "Course",
        "@id": courseId,
        name: copy.courseName,
        description: copy.courseDescription,
        provider: {
          "@type": "EducationalOrganization",
          "@id": providerId,
          name: program.universityName,
        },
        educationalLevel: copy.educationalLevel,
        about: {
          "@type": "Thing",
          name: program.field,
        },
        offers: {
          "@type": "Offer",
          category: "Tuition",
          price: program.tuitionAmount,
          priceCurrency: program.tuitionCurrency,
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Onsite",
          location: {
            "@type": "Place",
            name: program.universityName,
            address: {
              "@type": "PostalAddress",
              addressCountry: copy.countryCode,
            },
          },
        },
      },
    ],
  };
}
