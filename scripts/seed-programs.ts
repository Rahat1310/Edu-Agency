import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../db";
import { programs } from "../db/schema";
import { count } from "drizzle-orm";

type ProgramSeed = typeof programs.$inferInsert;

export const SEED_PROGRAMS: ProgramSeed[] = [
  // Malaysia is maintained in lib/malaysia/catalogue.json. Do not reseed mock annual fees.
  // ==========================================
  // CHINA (Currency: CNY)
  // ==========================================
  // 1) Zhejiang University (ZJU)
  {
    universityName: "Zhejiang University (ZJU)",
    country: "china",
    level: "bachelor",
    field: "Bachelor of Engineering in Computer Science & Technology",
    tuitionAmount: "32000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["September"],
    requirements:
      "Elite C9 League university. Strong HSC Science (GPA 4.50+) or A-Levels with ABB in Math and Physics. English-medium instruction.",
    scholarshipInfo:
      "CSC Chinese Government Scholarship Type B (Full tuition waiver, free dormitory + monthly living stipend).",
    isPublished: true,
  },
  {
    universityName: "Zhejiang University (ZJU)",
    country: "china",
    level: "bachelor",
    field: "Bachelor of Mechanical Engineering",
    tuitionAmount: "30000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["September"],
    requirements:
      "HSC Science with Mathematics and Physics (GPA 4.25+). Top 5 engineering faculties in China.",
    scholarshipInfo:
      "Zhejiang Provincial Government Scholarship (up to 30,000 CNY one-time waiver) and CSC funding.",
    isPublished: true,
  },
  {
    universityName: "Zhejiang University (ZJU)",
    country: "china",
    level: "master",
    field: "Master of Science in Artificial Intelligence",
    tuitionAmount: "42000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["September"],
    requirements:
      "Four-year Bachelor's degree in CS/Engineering with CGPA 3.20+. 2 Recommendation letters.",
    scholarshipInfo:
      "Full CSC Silk Road Scholarship: 100% tuition, campus housing, and 3,000 CNY/month living allowance.",
    isPublished: true,
  },

  // 2) Nanjing Medical University
  {
    universityName: "Nanjing Medical University",
    country: "china",
    level: "bachelor",
    field: "MBBS (Bachelor of Medicine & Bachelor of Surgery) - English Medium",
    tuitionAmount: "36000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["September"],
    requirements:
      "HSC Science with Biology, Physics, and Chemistry (minimum GPA 4.50 / 5.00). WHO and BMDC recognized curriculum.",
    scholarshipInfo:
      "Jiangsu Provincial Government scholarship (up to 20,000 CNY/yr) and University Outstanding Student Awards.",
    isPublished: true,
  },
  {
    universityName: "Nanjing Medical University",
    country: "china",
    level: "bachelor",
    field: "Bachelor of Pharmacy & Clinical Pharmacology",
    tuitionAmount: "32000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["September"],
    requirements:
      "HSC Science with Chemistry and Biology (GPA 4.00+). Comprehensive hospital laboratory training.",
    scholarshipInfo:
      "University merit scholarship covers up to 15,000 CNY/year for top international cohort.",
    isPublished: true,
  },

  // 3) Harbin Institute of Technology (HIT)
  {
    universityName: "Harbin Institute of Technology (HIT)",
    country: "china",
    level: "bachelor",
    field: "Bachelor of Aerospace & Mechanical Engineering",
    tuitionAmount: "28000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["September"],
    requirements:
      "HSC Science with Mathematics and Physics emphasis (GPA 4.25+). Top-ranked national engineering institution.",
    scholarshipInfo:
      "Full CSC and HIT Institutional scholarships can make elite STEM education cost far less than expected.",
    isPublished: true,
  },
  {
    universityName: "Harbin Institute of Technology (HIT)",
    country: "china",
    level: "bachelor",
    field: "Bachelor of Computer Science & Robotics",
    tuitionAmount: "28000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["September"],
    requirements:
      "HSC Science with strong Mathematics (GPA 4.25+). China's leading robotics research labs.",
    scholarshipInfo:
      "CSC Category A & B scholarships available for qualified international applicants.",
    isPublished: true,
  },

  // 4) Wuhan University of Technology (WUT)
  {
    universityName: "Wuhan University of Technology (WUT)",
    country: "china",
    level: "bachelor",
    field: "Bachelor of Computer Science & Logistics Engineering",
    tuitionAmount: "20000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["September"],
    requirements:
      "HSC Science GPA 3.50+ or equivalent. One of the most practical budget options for engineering students.",
    scholarshipInfo:
      "WUT Presidential Scholarship and Hubei Provincial awards provide substantial fee reductions for Bangladeshi students.",
    isPublished: true,
  },
  {
    universityName: "Wuhan University of Technology (WUT)",
    country: "china",
    level: "bachelor",
    field: "Bachelor of Civil Engineering",
    tuitionAmount: "20000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["September"],
    requirements:
      "HSC Science with Math and Physics (GPA 3.50+). English-medium curriculum.",
    scholarshipInfo:
      "Highly affordable living cost in Wuhan. Partial scholarships cover 5,000 to 15,000 CNY.",
    isPublished: true,
  },

  // 5) Northeast Normal University (NENU)
  {
    universityName: "Northeast Normal University (NENU)",
    country: "china",
    level: "language",
    field: "1-Year Intensive Chinese Language Preparation (HSK 1-4)",
    tuitionAmount: "15000.00",
    tuitionCurrency: "CNY",
    intakeMonths: ["March", "September"],
    requirements:
      "HSC completion or equivalent. Minimum age 18. No prior Chinese language required.",
    scholarshipInfo:
      "Start with language study, then unlock full CSC government scholarships for degree study.",
    isPublished: true,
  },

  // ==========================================
  // SOUTH KOREA (Currency: KRW)
  // ==========================================
  // 1) Seoul National University (SNU)
  {
    universityName: "Seoul National University (SNU)",
    country: "south_korea",
    level: "bachelor",
    field: "Bachelor of Science in Computer Science & Engineering",
    tuitionAmount: "6500000.00",
    tuitionCurrency: "KRW",
    intakeMonths: ["March", "September"],
    requirements:
      "Korea's #1 flagship public university. Exceptional HSC / A-Levels profile (GPA 5.00) with strong math and science.",
    scholarshipInfo:
      "GKS (Global Korea Scholarship) and SNU Global Hope Scholarship can cover full tuition and monthly living allowance.",
    isPublished: true,
  },
  {
    universityName: "Seoul National University (SNU)",
    country: "south_korea",
    level: "bachelor",
    field: "Bachelor of Business Administration (BBA)",
    tuitionAmount: "5500000.00",
    tuitionCurrency: "KRW",
    intakeMonths: ["March", "September"],
    requirements:
      "Outstanding academic record (HSC GPA 5.00). English proficiency IELTS 7.0 or TOEFL 100.",
    scholarshipInfo:
      "SNU President Fellowship and Global Korea Scholarship eligible.",
    isPublished: true,
  },

  // 2) KAIST
  {
    universityName:
      "KAIST (Korea Advanced Institute of Science and Technology)",
    country: "south_korea",
    level: "bachelor",
    field: "Bachelor of Science in Electrical Engineering & AI",
    tuitionAmount: "9000000.00",
    tuitionCurrency: "KRW",
    intakeMonths: ["March", "September"],
    requirements:
      "100% English taught. Outstanding STEM profile (Math/Physics). 2 Teacher recommendation letters. IELTS 6.5 or TOEFL 83.",
    scholarshipInfo:
      "Admitted international students receive KAIST International Scholarship: 100% tuition waiver + monthly stipend!",
    isPublished: true,
  },
  {
    universityName:
      "KAIST (Korea Advanced Institute of Science and Technology)",
    country: "south_korea",
    level: "bachelor",
    field: "Bachelor of Science in Computer Science",
    tuitionAmount: "9000000.00",
    tuitionCurrency: "KRW",
    intakeMonths: ["March", "September"],
    requirements:
      "100% English taught curriculum. Algorithms, Systems, AI, and Cybersecurity.",
    scholarshipInfo:
      "Full tuition grant for all 8 semesters + 350,000 KRW/month living allowance.",
    isPublished: true,
  },
  {
    universityName:
      "KAIST (Korea Advanced Institute of Science and Technology)",
    country: "south_korea",
    level: "bachelor",
    field: "Bachelor of Science in Mechanical & Aerospace Engineering",
    tuitionAmount: "9000000.00",
    tuitionCurrency: "KRW",
    intakeMonths: ["March", "September"],
    requirements:
      "High GPA in Math & Physics. Cutting-edge research labs in satellite and robotics engineering.",
    scholarshipInfo:
      "Complete scholarship package including full health insurance coverage.",
    isPublished: true,
  },

  // 3) Hanyang University
  {
    universityName: "Hanyang University (ERICA Campus)",
    country: "south_korea",
    level: "bachelor",
    field: "Bachelor of Engineering in Automotive & Software Engineering",
    tuitionAmount: "7500000.00",
    tuitionCurrency: "KRW",
    intakeMonths: ["March", "September"],
    requirements:
      "HSC with minimum GPA 3.80. Top industry-linked campus with Samsung, Hyundai, and LG research clusters.",
    scholarshipInfo:
      "Hanyang International Scholarship Program (HISP) awards 50% to 100% tuition waiver based on evaluation.",
    isPublished: true,
  },
  {
    universityName: "Hanyang University (ERICA Campus)",
    country: "south_korea",
    level: "bachelor",
    field: "Bachelor of Business Administration (BBA)",
    tuitionAmount: "6500000.00",
    tuitionCurrency: "KRW",
    intakeMonths: ["March", "September"],
    requirements:
      "HSC GPA 3.50+ in any stream. Global business track taught in English.",
    scholarshipInfo:
      "HISP tuition waiver of 50% or 70% based on application interview score.",
    isPublished: true,
  },

  // 4) Yonsei University
  {
    universityName: "Yonsei University",
    country: "south_korea",
    level: "language",
    field: "Korean Language Institute (KLI) Intensive Program (D-4 Visa)",
    tuitionAmount: "7200000.00",
    tuitionCurrency: "KRW",
    intakeMonths: ["March", "June", "September", "December"],
    requirements:
      "HSC pass (minimum GPA 3.50). Valid passport and bank solvency certificate ($10,000 USD). 4 quarterly terms per year.",
    scholarshipInfo:
      "Fast-track bridge to TOPIK Level 4, unlocking direct admission and GKS scholarships for degree study.",
    isPublished: true,
  },
  {
    universityName: "Yonsei University",
    country: "south_korea",
    level: "bachelor",
    field:
      "Underwood International College (UIC) - Global Economics & Business",
    tuitionAmount: "11000000.00",
    tuitionCurrency: "KRW",
    intakeMonths: ["March", "September"],
    requirements:
      "Top academic profile (HSC GPA 4.50+). English admissions essay and online interview. 100% English taught.",
    scholarshipInfo:
      "Merit scholarships covering 33%, 50%, or 100% of four-year tuition available for exceptional applicants.",
    isPublished: true,
  },

  // ==========================================
  // INDIA (Currency: INR)
  // ==========================================
  // 1) University of Delhi (DU)
  {
    universityName: "University of Delhi (DU)",
    country: "india",
    level: "bachelor",
    field: "Bachelor of Commerce (B.Com Hons)",
    tuitionAmount: "180000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["July", "August"],
    requirements:
      "HSC / 12th standard with Mathematics / Economics. High academic merit. Foreign Students Registry (FSR) application.",
    scholarshipInfo:
      "ICCR (Indian Council for Cultural Relations) fully funded scholarship covers 100% fees, hostel, and monthly stipend.",
    isPublished: true,
  },
  {
    universityName: "University of Delhi (DU)",
    country: "india",
    level: "bachelor",
    field: "Bachelor of Arts (Hons) in Economics",
    tuitionAmount: "180000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["July", "August"],
    requirements:
      "HSC with high marks in Mathematics (GPA 4.50+). Delhi School of Economics pathway.",
    scholarshipInfo:
      "ICCR full scholarship eligible for Bangladeshi applicants.",
    isPublished: true,
  },

  // 2) Vellore Institute of Technology (VIT - Vellore)
  {
    universityName: "Vellore Institute of Technology (VIT - Vellore)",
    country: "india",
    level: "bachelor",
    field: "B.Tech in Computer Science & Engineering (AI & Machine Learning)",
    tuitionAmount: "320000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["July"],
    requirements:
      "Minimum 65% aggregate in Physics, Chemistry, and Mathematics in HSC / 12th standard. Direct foreign admissions track.",
    scholarshipInfo:
      "Recognized private engineering institution. Study in India (SII) scheme fee concessions available.",
    isPublished: true,
  },
  {
    universityName: "Vellore Institute of Technology (VIT - Vellore)",
    country: "india",
    level: "bachelor",
    field: "B.Tech in Electronics & Communication Engineering (ECE)",
    tuitionAmount: "300000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["July"],
    requirements:
      "HSC Science with Physics, Math, and Chemistry (minimum 60% marks). State-of-the-art semiconductor and telecom labs.",
    scholarshipInfo:
      "SII portal registration provides merit waivers up to 30%.",
    isPublished: true,
  },
  {
    universityName: "Vellore Institute of Technology (VIT - Vellore)",
    country: "india",
    level: "bachelor",
    field: "B.Tech in Mechanical Engineering",
    tuitionAmount: "280000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["July"],
    requirements:
      "HSC Science with Math and Physics (60% aggregate). Automotive and design laboratories.",
    scholarshipInfo:
      "High placement rate with international manufacturing and technology corporations.",
    isPublished: true,
  },
  {
    universityName: "Vellore Institute of Technology (VIT - Vellore)",
    country: "india",
    level: "bachelor",
    field: "Bachelor of Business Administration (BBA)",
    tuitionAmount: "220000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["July"],
    requirements:
      "HSC in any stream with minimum 55% marks. Direct foreign national application.",
    scholarshipInfo:
      "Comprehensive business curriculum with corporate analytics tracks.",
    isPublished: true,
  },

  // 3) Manipal Academy of Higher Education (MAHE)
  {
    universityName: "Manipal Academy of Higher Education (MAHE)",
    country: "india",
    level: "bachelor",
    field: "Bachelor of Pharmacy (B.Pharm)",
    tuitionAmount: "260000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["August"],
    requirements:
      "HSC Science with Chemistry and Biology (minimum 55% marks). Pharmacy Council of India (PCI) recognized.",
    scholarshipInfo:
      "Manipal International Scholarship provides up to 20% tuition concession. NAAC A++ ranked.",
    isPublished: true,
  },
  {
    universityName: "Manipal Academy of Higher Education (MAHE)",
    country: "india",
    level: "bachelor",
    field: "B.Sc in Nursing & Allied Health Sciences",
    tuitionAmount: "240000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["August"],
    requirements:
      "HSC Science with Biology, Physics, and Chemistry (minimum 50% marks). Indian Nursing Council (INC) recognized.",
    scholarshipInfo:
      "World-class teaching hospitals with guaranteed clinical rotation experience.",
    isPublished: true,
  },
  {
    universityName: "Manipal Academy of Higher Education (MAHE)",
    country: "india",
    level: "bachelor",
    field: "B.Tech in Computer Science & Engineering",
    tuitionAmount: "36000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["August"],
    requirements:
      "HSC Science with Math and Physics (minimum 60% marks). MIT Manipal engineering campus.",
    scholarshipInfo:
      "Prestigious private university campus with alumni across Silicon Valley.",
    isPublished: true,
  },

  // 4) Lovely Professional University (LPU)
  {
    universityName: "Lovely Professional University (LPU)",
    country: "india",
    level: "bachelor",
    field: "B.Tech in Computer Science & Engineering (AI & ML)",
    tuitionAmount: "190000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["July", "August"],
    requirements:
      "HSC Science with Math and Physics (minimum 50% marks). Multiple flexible application cycles.",
    scholarshipInfo:
      "LPUNEST / HSC academic performance waivers can reduce annual tuition by 20% to 50% for Bangladeshi students.",
    isPublished: true,
  },
  {
    universityName: "Lovely Professional University (LPU)",
    country: "india",
    level: "bachelor",
    field: "Bachelor of Business Administration (BBA)",
    tuitionAmount: "160000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["July", "August"],
    requirements:
      "HSC in any stream with minimum 50% marks. Specializations in Digital Marketing, Business Analytics, and Logistics.",
    scholarshipInfo: "Merit waivers up to 40% based on intermediate marks.",
    isPublished: true,
  },
  {
    universityName: "Lovely Professional University (LPU)",
    country: "india",
    level: "bachelor",
    field: "B.Sc (Hons) in Agriculture",
    tuitionAmount: "180000.00",
    tuitionCurrency: "INR",
    intakeMonths: ["July", "August"],
    requirements:
      "HSC Science with Biology, Physics, Chemistry (minimum 55% marks). ICAR accredited program with experimental farm labs.",
    scholarshipInfo:
      "Highly popular with Bangladeshi students due to ICAR recognition and low living expenses.",
    isPublished: true,
  },
];

async function main() {
  const force = process.argv.includes("--force") || process.argv.includes("-f");

  const rows = await db.select({ value: count() }).from(programs);
  const currentCount = rows[0]?.value ?? 0;

  console.log(`Current programs count in DB: ${currentCount}`);

  if (Number(currentCount) > 0 && !force) {
    console.log(
      "Database already has programs. Re-seeding with updated seeder_info catalog...",
    );
    // Clear out old programs and replace with fresh seeder_info list
    await db.delete(programs);
    console.log("Cleared existing programs.");
  }

  console.log(
    `Seeding ${SEED_PROGRAMS.length} verified programs from seeder_info.txt across China, India, Malaysia, and South Korea...`,
  );

  const { CHINA_PROGRAM_CORRECTIONS } =
    await import("../lib/china-program-corrections");
  await db.insert(programs).values(
    SEED_PROGRAMS.map((program) => {
      const correction =
        program.country === "china"
          ? CHINA_PROGRAM_CORRECTIONS.find(
              (item) =>
                item.universityName === program.universityName &&
                item.field === program.field,
            )
          : undefined;
      return correction ? { ...program, ...correction } : program;
    }),
  );

  const updatedRows = await db.select({ value: count() }).from(programs);
  const newCount = updatedRows[0]?.value ?? 0;

  console.log(`Seeding complete! Total published programs in DB: ${newCount}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to seed programs:", err);
  process.exit(1);
});
