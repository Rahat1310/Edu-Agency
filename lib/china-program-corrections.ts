// Reviewed against official admissions guidance on 2026-11-11.
// Match existing catalog identities; retain IDs and students' saved program links.
export const CHINA_PROGRAM_CORRECTIONS = [
  {
    universityName: "Zhejiang University (ZJU)",
    field: "Bachelor of Engineering in Computer Science & Technology",
    requirements:
      "Strong secondary-school results and subject prerequisites are required. Confirm the exact degree title and teaching language in ZJU’s current catalog. Chinese-taught undergraduate applications require HSK; the 2026/27 guide also requires CSCA. The listed tuition is a planning estimate, not a verified fee quotation.",
    scholarshipInfo:
      "ZJU’s undergraduate CSC Type A and Zhejiang Government Scholarship routes are for Chinese-taught programs. English-taught scholarships have separate program-specific terms. Awards are competitive; funding is confirmed only by a written award.",
  },
  {
    universityName: "Zhejiang University (ZJU)",
    field: "Bachelor of Mechanical Engineering",
    requirements:
      "Secondary-school Mathematics and Physics preparation is relevant. Confirm the current program title, teaching language, HSK requirements and required CSCA subjects in ZJU’s undergraduate catalog. The listed tuition is a planning estimate.",
    scholarshipInfo:
      "Zhejiang Government Scholarship and undergraduate CSC Type A eligibility at ZJU is limited to Chinese-taught programs. Confirm the current award value, deadline and renewal terms; no scholarship is guaranteed.",
  },
  {
    universityName: "Zhejiang University (ZJU)",
    field: "Master of Science in Artificial Intelligence",
    requirements:
      "A relevant bachelor’s degree and program-specific academic and language evidence are required. Verify the exact degree title, supervisor or faculty requirements, references, current fees and application deadline in the graduate catalog.",
    scholarshipInfo:
      "Investigate current CSC and university postgraduate scholarship calls. Eligibility depends on the specific program and scholarship route. A tuition waiver, housing or stipend applies only when included in the written award.",
  },
  {
    universityName: "Nanjing Medical University",
    field: "MBBS (Bachelor of Medicine & Bachelor of Surgery) - English Medium",
    tuitionAmount: "34000.00",
    requirements:
      "Six-year English-taught MBBS, including internship. The 2026 guide requires CSCA Mathematics and Chemistry, relevant school science subjects, English-language evidence and an interview. Confirm academic equivalence and the next intake’s requirements with NMU. Check BMDC eligibility and registration requirements before enrolling.",
    scholarshipInfo:
      "The 2026 MBBS guide lists competitive full, half and quarter tuition scholarships with limited quotas. Confirm the next intake’s awards and renewal rules directly with NMU; budget for full tuition until awarded in writing.",
  },
  {
    universityName: "Nanjing Medical University",
    field: "Bachelor of Pharmacy & Clinical Pharmacology",
    requirements:
      "This subject listing needs confirmation against NMU’s current international admissions catalog. Verify the exact degree title, teaching language, science prerequisites, international applicant eligibility and tuition before applying or paying a deposit.",
    scholarshipInfo:
      "Confirm whether the exact program has an active scholarship call. Scholarship amounts and coverage have not been verified for this listing; do not assume a fee reduction.",
  },
  ...[
    "Bachelor of Aerospace & Mechanical Engineering",
    "Bachelor of Computer Science & Robotics",
  ].map((field) => ({
    universityName: "Harbin Institute of Technology (HIT)",
    field,
    tuitionAmount: "26000.00",
    requirements:
      "HIT’s 2027 undergraduate guide requires secondary-school completion, CSCA and language evidence matching the chosen major. The listed CNY 26,000/year is the published English-taught tuition; Chinese-taught tuition is CNY 20,000/year. Confirm the exact degree title, teaching language and required CSCA subjects in the current major catalog.",
    scholarshipInfo:
      "HIT lists undergraduate CSC Type A and competitive HIT scholarships. Check the current call, age limits, coverage and renewal requirements. Full tuition waivers and any living allowance apply only if explicitly awarded.",
  })),
  ...[
    "Bachelor of Computer Science & Logistics Engineering",
    "Bachelor of Civil Engineering",
  ].map((field) => ({
    universityName: "Wuhan University of Technology (WUT)",
    field,
    requirements:
      "Confirm the exact degree title, teaching language, academic prerequisites, language evidence and current tuition with Wuhan University of Technology’s international admissions office. The listed fee is a planning estimate; combined subject labels may not be a single official degree.",
    scholarshipInfo:
      "Check the current university and external scholarship calls for the exact degree and intake. Availability, coverage and award values have not been verified for this listing; budget for full fees until a written award is received.",
  })),
  {
    universityName: "Northeast Normal University (NENU)",
    field: "1-Year Intensive Chinese Language Preparation (HSK 1-4)",
    requirements:
      "Confirm the current language-course duration, entry requirements, minimum age, start dates and tuition with NENU. HSK certification requires a separate exam; completing language study does not automatically grant degree admission.",
    scholarshipInfo:
      "Language-study and degree scholarships have separate eligibility rules and application processes. Completing this course does not guarantee CSC funding or admission to a degree program.",
  },
] as const;
