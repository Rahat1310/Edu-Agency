import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Check,
  GraduationCap,
  Languages,
  MapPin,
  MessageCircle,
  Plus,
  Wallet,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ChinaReveal } from "@/components/marketing/china-reveal";
import {
  chinaOffers,
  chinaInstitutions,
  chinaRankingExamples,
  chinaRankingEdition,
  chinaRankingsCheckedOn,
} from "@/lib/china-2027";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import styles from "./china-destination-page.module.css";

const photographs = [
  {
    src: "/images/china-xiamen-campus.webp",
    location: "Xiamen University, Fujian",
    alt: "The Jiageng buildings and tree-lined Furong Lake at Xiamen University",
    source:
      "https://commons.wikimedia.org/wiki/File:Xiamen_University_07076-Xiamen_(48814339602).jpg",
    author: "xiquinhosilva",
    license: "https://creativecommons.org/licenses/by/2.0/",
    licenseName: "CC BY 2.0",
  },
  {
    src: "/images/china-chengdu-street.webp",
    location: "Jinli Street, Chengdu",
    alt: "People exploring Jinli Street beneath red lanterns and traditional roofs in Chengdu",
    source:
      "https://commons.wikimedia.org/wiki/File:Jinli_Street_35208-Chengdu_(49067632943).jpg",
    author: "xiquinhosilva",
    license: "https://creativecommons.org/licenses/by/2.0/",
    licenseName: "CC BY 2.0",
  },
  {
    src: "/images/china-shanghai-skyline.webp",
    location: "Shanghai, after sunset",
    alt: "Shanghai’s illuminated Pudong skyline across the Huangpu River at night",
    source:
      "https://commons.wikimedia.org/wiki/File:Shanghai_skyline_at_night.jpg",
    author: "Ernest Jourdier",
    license: "https://creativecommons.org/licenses/by/4.0/",
    licenseName: "CC BY 4.0",
  },
] as const;

export function ChinaDestinationPage({ locale }: { locale: Locale }) {
  const bn = locale === "bn";
  const href = (path: string) => localizedHref(path, locale);
  const explore = href("/programs?country=china");
  const assessment = href("/consultation?destination=china");
  const number = (value: number) =>
    new Intl.NumberFormat(bn ? "bn-BD" : "en-GB", {
      useGrouping: false,
    }).format(value);
  const checked = new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(chinaRankingsCheckedOn));
  const c = bn
    ? {
        eyebrow: "আপনার আগামী দিনের ক্যাম্পাস",
        title: "চীনে পড়াশোনা।",
        accent: "নতুন সম্ভাবনার শুরু।",
        intro:
          "বিশ্ববিদ্যালয় বেছে নেওয়া আপনার ও আপনার পরিবারের জন্য বড় একটি সিদ্ধান্ত। চলুন, আপনার পছন্দের বিষয়, ক্যাম্পাস আর বাজেট মিলিয়ে পথ খুঁজি।",
        explore: "বিশ্ববিদ্যালয় ও অফার দেখুন",
        assessment: "কাউন্সেলরের সঙ্গে কথা বলুন",
        reassurance: "বিনামূল্যে প্রোফাইল মূল্যায়ন · বাংলাদেশ থেকে পাশে আছি",
        note: "প্রথমে আপনার স্বপ্নের কথা বলুন। বাকি পরিকল্পনা একসঙ্গে করি।",
        noteBody:
          "বিষয় ঠিক করেছেন, নাকি এখনো ভাবছেন? দুই অবস্থাতেই শুরু করতে পারেন।",
        offers: "তুলনা করার মতো অফার",
        institutions: "শিক্ষাপ্রতিষ্ঠান",
        year: "আসন্ন ইনটেকের বছর",
        nav: [
          "কেন চীন",
          "ক্যাম্পাস জীবন",
          "বিশ্ববিদ্যালয়",
          "স্কলারশিপ",
          "ইনটেক",
        ],
        whyEyebrow: "কেন চীনে পড়াশোনা",
        whyTitle: "আপনার লক্ষ্যকে ঘিরেই হোক সিদ্ধান্ত।",
        whyBody:
          "কারও কাছে স্বপ্নটা ল্যাবে নতুন কিছু তৈরি করা। কারও কাছে চিকিৎসক হওয়া, ব্যবসা শেখা কিংবা নতুন ভাষায় কথা বলা। আপনার শুরুর গল্প যেটাই হোক, সঠিক প্রোগ্রাম দিয়ে শুরু করুন।",
        reasons: [
          [
            "নিজের পছন্দের বিষয় নিয়ে এগিয়ে যান",
            "Engineering, Computer Science, Business বা Medicine—আপনার আগ্রহ ও আগের পড়াশোনার সঙ্গে যে বিষয়টি মেলে, সেটিই বেছে নিন।",
          ],
          [
            "পরিবারের বাজেট মাথায় রাখুন",
            "টিউশন, থাকার খরচ ও স্কলারশিপ মিলিয়ে পুরো হিসাব দেখুন। আমরা কী অন্তর্ভুক্ত আর কোন খরচ নিজের, তা বুঝতে সাহায্য করব।",
          ],
          [
            "আপনার জন্য মানানসই পথ বেছে নিন",
            "সরাসরি ডিগ্রি, ভাষা কোর্স বা foundation—আপনার প্রস্তুতি অনুযায়ী পথ রয়েছে। পড়ার মাধ্যম ও পরের ধাপে যাওয়ার শর্ত জেনে নিন।",
          ],
        ],
        lifeEyebrow: "ক্লাসের বাইরেও একটি নতুন জীবন",
        lifeTitle: "নিজেকে এখানে ভাবতে পারেন?",
        lifeBody:
          "সকালের ক্যাম্পাস, বন্ধুদের সঙ্গে নতুন শহর চেনা, একটু একটু করে Mandarin শেখা। বিশ্ববিদ্যালয় বেছে নেওয়ার সময় এই দৈনন্দিন জীবনটাও ভাবুন।",
        lifeLabels: [
          "ক্যাম্পাসে একটু বিরতি",
          "নতুন শহর, নতুন অভিজ্ঞতা",
          "দিন শেষে অন্য এক দৃশ্য",
        ],
        practicalTitle: "ছোট ছোট প্রশ্ন। স্বস্তির বড় কারণ।",
        practical: [
          [
            "কোথায় থাকবেন?",
            "ডরমিটরির রুম, বুকিং ও খরচ অফারভেদে আলাদা। কিছু প্রোগ্রামে নিজের বাসা খুঁজতে হয়।",
          ],
          [
            "খাবারের ব্যবস্থা কী?",
            "HUST-এ Muslim dining-এর তথ্য রয়েছে। আপনার ক্যাম্পাসে খাবার ও আশপাশের সুবিধা আগে জেনে নিন।",
          ],
          [
            "নতুন পরিবেশে মানিয়ে নেওয়া?",
            "ক্লাসের ভাষা, ক্যাম্পাসের কার্যক্রম ও যাতায়াত সম্পর্কে জানুন। নিজের দৈনন্দিন খরচও বাজেটে রাখুন।",
          ],
        ],
        ranksEyebrow: "বিশ্ববিদ্যালয় খুঁজে দেখুন",
        ranksTitle: "আপনার তালিকার শুরু এখান থেকেই।",
        ranksBody:
          "আমাদের অফারে থাকা কয়েকটি বিশ্ববিদ্যালয়। র‍্যাঙ্কিংয়ের পাশাপাশি আপনার বিষয়, ভর্তি যোগ্যতা ও মোট খরচ মিলিয়ে দেখুন।",
        worldRank: "বিশ্ব র‍্যাঙ্কিং",
        tied: "যৌথ অবস্থান",
        viewOffers: "প্রোগ্রাম দেখুন",
        rankSource: "QS-এর তথ্য",
        allUniversities: "সব শিক্ষাপ্রতিষ্ঠান দেখুন",
        fundingEyebrow: "আপনার বাজেটের পরিকল্পনা",
        fundingTitle: "স্কলারশিপ বুঝে নিন। নিশ্চিন্তে পরিকল্পনা করুন।",
        fundingBody:
          "স্কলারশিপ পড়াশোনার খরচ কমাতে পারে। কোন ফি মওকুফ, কত বছরের জন্য আর পরের বছর কী শর্ত—সেগুলো আগে পরিষ্কার করে নিই।",
        awards: [
          [
            "টিউশন ফি",
            "কিছু অফারে পূর্ণ বা আংশিক টিউশন ছাড় রয়েছে। ১০০% tuition waiver মানেই সব খরচ অন্তর্ভুক্ত নয়।",
          ],
          [
            "থাকা ও মাসিক ভাতা",
            "নির্বাচিত অ্যাওয়ার্ডে আবাসন বা stipend থাকে। পরিমাণ, প্রদানের মাস ও মেয়াদ আলাদা করে দেখুন।",
          ],
          [
            "পরের বছরের শর্ত",
            "কিছু অ্যাওয়ার্ড শুধু প্রথম বছরের। পরের বছরে ফলাফল, উপস্থিতি ও নতুন আবেদনের শর্ত থাকতে পারে।",
          ],
        ],
        fundingCta: "স্কলারশিপসহ অফার দেখুন",
        costCta: "মোট খরচ হিসাব করুন",
        fundingNote:
          "লিখিত অ্যাওয়ার্ড পাওয়ার আগে সম্পূর্ণ ফি ধরে বাজেট করুন। ভর্তি ও স্কলারশিপের সিদ্ধান্ত আলাদা হতে পারে।",
        routesEyebrow: "আপনার পরবর্তী ধাপ",
        routesTitle: "কখন শুরু করতে চান?",
        routesBody:
          "প্রথম ক্লাস কবে শুরু হবে, সেটিই entry intake। মার্চের ভাষা বা foundation থেকে সেপ্টেম্বরে ডিগ্রি শুরু হতে পারে—দুটি তারিখ আলাদা।",
        springLabel: "মার্চে শুরু",
        autumnLabel: "সেপ্টেম্বরে শুরু",
        springBody:
          "ভাষা, foundation, নির্বাচিত সরাসরি ডিগ্রি ও postgraduate অফার দেখুন। পরের ধাপে যেতে পরীক্ষা বা ভাষার শর্ত থাকতে পারে।",
        autumnBody:
          "ইংরেজি ও চীনা মাধ্যমে bachelor's, master's ও PhD বিকল্প দেখুন। বিষয় ও স্কলারশিপভেদে আবেদনের সময় আলাদা।",
        intakeCta: "এই ইনটেকের অফার দেখুন",
        pending:
          "সময় এখনো ঠিক করেননি? চলমান ভর্তি ও অনিশ্চিত শুরুর তারিখও আলাদা করে দেখতে পারেন।",
        rolling: "চলমান ভর্তি",
        unconfirmed: "তারিখ নিশ্চিত করা বাকি",
        csca: "CSCA ও ভাষার শর্ত নিয়ে সাহায্য চান?",
        cscaBody:
          "কোন বিষয়ে পরীক্ষা, HSK বা English proficiency লাগবে, তা আপনার নির্বাচিত প্রোগ্রামের সঙ্গে মিলিয়ে দেখব। Foundation শেষ করা নিজে থেকেই ডিগ্রি ভর্তি নিশ্চিত করে না।",
        faqEyebrow: "আপনার মনে হয়তো এই প্রশ্নগুলো আছে",
        faqTitle: "জেনে-বুঝে এগিয়ে যান।",
        questions: [
          [
            "IELTS না থাকলে কোথা থেকে শুরু করব?",
            "আপনার পছন্দের কোর্স দিয়ে শুরু করুন। কিছু অফারে MOI বা বিকল্প প্রমাণ গ্রহণ করা হয়; অন্যগুলোতে IELTS, TOEFL, Duolingo বা HSK দরকার। আপনার জন্য কোনটি প্রযোজ্য, তা মিলিয়ে দেব।",
          ],
          [
            "স্কলারশিপ কি আগে থেকেই নিশ্চিত?",
            "না। যোগ্যতা, মূল্যায়ন, আসন ও বিশ্ববিদ্যালয়ের সিদ্ধান্তের ওপর অ্যাওয়ার্ড নির্ভর করে। লিখিত সিদ্ধান্ত পাওয়ার আগে নিশ্চিত ধরে পরিকল্পনা করবেন না।",
          ],
          [
            "ক্যাম্পাসে থাকার জায়গা পাব?",
            "কিছু অফারে আবাসন আছে, কিছুতে আলাদা ফি দিতে হয়, আবার কিছুতে বাইরে থাকতে হয়। রুমের ধরন, প্রাপ্যতা ও বুকিংয়ের সময় আগে নিশ্চিত করতে হবে।",
          ],
          [
            "আমার জন্য সঠিক বিশ্ববিদ্যালয় কোনটি?",
            "আপনার ফলাফল, আগ্রহ, ভাষার প্রস্তুতি ও পরিবারের বাজেট জানালে আমরা একটি উপযুক্ত তালিকা দিয়ে শুরু করতে পারি। প্রোফাইল মূল্যায়ন বিনামূল্যে।",
          ],
        ],
        supportEyebrow: "প্রথম ধাপটা সহজ করি",
        supportTitle: "আপনার গল্প শুনতে চাই।",
        supportBody:
          "আপনার ফলাফল, আগ্রহ আর বাজেট নিয়ে বলুন। কোন বিশ্ববিদ্যালয় বা কোন স্কলারশিপ দিয়ে শুরু করবেন, আমরা একসঙ্গে বুঝে নেব।",
        photoCredits: "ছবির কৃতিত্ব",
        photoNote: "ছবিগুলো ওয়েবের জন্য ছোট করা হয়েছে; লেআউটে ক্রপ হতে পারে।",
      }
    : {
        eyebrow: "YOUR NEXT CAMPUS, YOUR NEXT CHAPTER",
        title: "Study in China.",
        accent: "See what’s possible.",
        intro:
          "Choosing a university is a big decision, for you and your family. Let’s find a subject you love, a campus you can picture yourself in, and a budget that makes sense.",
        explore: "Explore universities & offers",
        assessment: "Talk to a counsellor",
        reassurance: "Free profile assessment · Guidance from Bangladesh",
        note: "Bring your ambition. We’ll help you make a plan.",
        noteBody:
          "Already have a subject in mind? Still figuring it out? Either is a good place to start.",
        offers: "offers to compare",
        institutions: "institutions to explore",
        year: "upcoming entry year",
        nav: [
          "Why China",
          "Campus life",
          "Universities",
          "Scholarships",
          "Intakes",
        ],
        whyEyebrow: "WHY STUDY IN CHINA",
        whyTitle: "Make room for your ambitions.",
        whyBody:
          "Maybe you want to build something in a lab. Care for people. Understand business. Or learn a language that opens up a new part of the world. Start with what matters to you.",
        reasons: [
          [
            "A subject you want to spend time with",
            "Explore engineering, computing, business, medicine and more. We’ll help you match your interests and academic background with the right program.",
          ],
          [
            "A plan your family can understand",
            "Look at tuition, living costs and scholarship conditions together. Know what is covered and what you’ll need to budget for yourself.",
          ],
          [
            "A starting point that suits you",
            "Direct degrees, language courses and foundation pathways offer different ways in. Choose your teaching language and check what it takes to progress.",
          ],
        ],
        lifeEyebrow: "A LITTLE OF LIFE BETWEEN LECTURES",
        lifeTitle: "Can you picture yourself here?",
        lifeBody:
          "A morning walk to class. A new neighbourhood to explore with friends. Your first conversation in Mandarin. Think about the everyday life you want, as well as the degree.",
        lifeLabels: [
          "A pause on campus",
          "A new city to get to know",
          "A different view after class",
        ],
        practicalTitle: "The little details help you feel at home.",
        practical: [
          [
            "Where will you live?",
            "Check your room type, booking arrangements and costs. Some programs offer dormitories; others need you to arrange your own home.",
          ],
          [
            "What about food?",
            "HUST lists Muslim dining options. Ask about food, daily essentials and nearby services at the campus you choose.",
          ],
          [
            "How will you settle in?",
            "Find out about the language of your classes, campus activities and getting around. Make space in your budget for daily life, too.",
          ],
        ],
        ranksEyebrow: "UNIVERSITIES TO GET TO KNOW",
        ranksTitle: "A few places to begin your shortlist.",
        ranksBody:
          "These universities feature in our current offers. Look at their world ranking alongside your subject, entry requirements and the total cost of studying.",
        worldRank: "World rank",
        tied: "Tied position",
        viewOffers: "Explore programs",
        rankSource: "QS profile",
        allUniversities: "Explore all institutions",
        fundingEyebrow: "LET’S TALK ABOUT THE BUDGET",
        fundingTitle: "A scholarship you understand. A plan you can trust.",
        fundingBody:
          "Scholarships can make a real difference. First, get clear on which fees are covered, how long the support lasts and what happens in your next year.",
        awards: [
          [
            "Your tuition",
            "Selected offers have partial or full tuition waivers. A 100% tuition scholarship covers tuition; other expenses need their own funding.",
          ],
          [
            "Your home and daily costs",
            "Some awards include housing or a monthly stipend. Check the amount, payment months and duration on the individual offer.",
          ],
          [
            "Your next year",
            "Some awards cover the first year only. Later funding may depend on grades, attendance, annual review or a fresh application.",
          ],
        ],
        fundingCta: "Explore scholarship offers",
        costCta: "Estimate your full costs",
        fundingNote:
          "Budget for the full fee until you receive a written award. Admission and scholarship decisions may be separate.",
        routesEyebrow: "FIND YOUR STARTING POINT",
        routesTitle: "When would you like to begin?",
        routesBody:
          "Your entry intake is when your first classes begin. A March language or foundation stage may lead to a September degree start. Keep those two dates separate.",
        springLabel: "A spring start",
        autumnLabel: "An autumn start",
        springBody:
          "Explore language courses, foundation pathways, selected direct degrees and postgraduate offers. Check the exams and language requirements for your next step.",
        autumnBody:
          "Explore English- and Chinese-taught bachelor’s, master’s and PhD options. Application windows and scholarship deadlines depend on your program.",
        intakeCta: "Explore this intake",
        pending:
          "Still working out your timing? You can also browse rolling enrollment and offers with a start date awaiting confirmation.",
        rolling: "Rolling enrollment",
        unconfirmed: "Start date to be confirmed",
        csca: "Need a hand with CSCA or language requirements?",
        cscaBody:
          "We’ll help you check the test subjects, HSK or English evidence for your chosen program. Completing foundation study does not automatically secure a degree place.",
        faqEyebrow: "YOU MIGHT BE WONDERING",
        faqTitle: "A little clarity before you decide.",
        questions: [
          [
            "Where do I start if I don’t have IELTS?",
            "Start with the course you’re interested in. Some offers accept MOI or alternative evidence; others need IELTS, TOEFL, Duolingo or HSK. We can help you check which requirement applies to you.",
          ],
          [
            "Can I count on getting a scholarship?",
            "Awards depend on eligibility, assessment, available places and the university’s decision. Wait for a written award before treating funding as confirmed.",
          ],
          [
            "Will I have a room on campus?",
            "Some offers include housing, some list separate dormitory charges, and others require off-campus accommodation. Confirm the room type, availability and booking deadline before you travel.",
          ],
          [
            "How do I know which university is right for me?",
            "Tell us about your results, interests, language preparation and family budget. We can start with a shortlist that fits your profile. Your profile assessment is free.",
          ],
        ],
        supportEyebrow: "LET’S MAKE THE FIRST STEP SIMPLE",
        supportTitle: "Tell us your story.",
        supportBody:
          "Your results. Your interests. What your family has in mind. We’ll help you work through the options and find a sensible place to start.",
        photoCredits: "Photography credits",
        photoNote: "Photographs resized for the web and cropped by the layout.",
      };
  const reasonIcons = [GraduationCap, Wallet, Languages];
  const sections = [
    "why-china",
    "campus-life",
    "universities",
    "scholarships",
    "intakes",
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="china-title">
        <PageShell className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{c.eyebrow}</p>
            <h1 id="china-title" className={styles.heroTitle}>
              {c.title}
              <span>{c.accent}</span>
            </h1>
            <p className={styles.heroIntro}>{c.intro}</p>
            <div className={styles.actions}>
              <Link href={explore} className={styles.primary}>
                {c.explore}
              </Link>
              <Link href={assessment} className={styles.textLink}>
                <MessageCircle size={19} aria-hidden="true" />
                {c.assessment}
              </Link>
            </div>
            <p className={styles.reassurance}>
              <Check size={16} aria-hidden="true" />
              {c.reassurance}
            </p>
          </div>
          <div className={styles.heroVisual}>
            <figure className={styles.heroPhoto}>
              <Image
                src="/images/china-hust-campus.jpg"
                alt={
                  bn
                    ? "Wuhan-এর HUST ক্যাম্পাসের সবুজ পরিবেশ ও শিক্ষাভবন"
                    : "Leafy grounds and academic buildings at HUST in Wuhan"
                }
                fill
                priority
                sizes="(max-width: 760px) 100vw, 48vw"
              />
              <figcaption>
                <MapPin size={15} aria-hidden="true" />
                HUST · Wuhan
              </figcaption>
            </figure>
            <figure className={styles.cityPhoto}>
              <Image
                src={photographs[2].src}
                alt={
                  bn ? "রাতের আলোয় সাংহাইয়ের আকাশরেখা" : photographs[2].alt
                }
                fill
                sizes="(max-width: 760px) 45vw, 260px"
              />
              <figcaption>Shanghai, China</figcaption>
            </figure>
            <div className={styles.heroNote}>
              <GraduationCap size={24} aria-hidden="true" />
              <p>
                {bn
                  ? "আপনার নতুন শুরুর অপেক্ষায়"
                  : "A new chapter looks good on you."}
              </p>
            </div>
          </div>
        </PageShell>
        <PageShell>
          <dl className={styles.stats}>
            {[
              [number(chinaOffers.length), c.offers],
              [number(chinaInstitutions.length), c.institutions],
              [number(2027), c.year],
            ].map(([value, label]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </PageShell>
      </section>
      <nav
        className={styles.sectionNav}
        aria-label={bn ? "চীনে পড়াশোনার গাইড" : "Explore the China guide"}
      >
        <PageShell className={styles.navInner}>
          {c.nav.map((label, index) => (
            <a key={label} href={"#" + sections[index]}>
              {label}
            </a>
          ))}
        </PageShell>
      </nav>
      <section id="why-china" className={styles.section}>
        <PageShell className={styles.whyGrid}>
          <ChinaReveal>
            <p className={styles.eyebrow}>{c.whyEyebrow}</p>
            <h2 className={styles.title}>{c.whyTitle}</h2>
            <p className={styles.body}>{c.whyBody}</p>
            <div className={styles.personalNote}>
              <p>{c.note}</p>
              <span>{c.noteBody}</span>
            </div>
          </ChinaReveal>
          <div className={styles.reasons}>
            {c.reasons.map(([title, body], index) => {
              const Icon = reasonIcons[index] ?? GraduationCap;
              return (
                <ChinaReveal key={title} delay={index * 70}>
                  <div className={styles.reason}>
                    <span className={styles.icon}>
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{body}</p>
                    </div>
                  </div>
                </ChinaReveal>
              );
            })}
          </div>
        </PageShell>
      </section>
      <section id="campus-life" className={styles.life}>
        <PageShell>
          <ChinaReveal className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>{c.lifeEyebrow}</p>
              <h2 className={styles.title}>{c.lifeTitle}</h2>
            </div>
            <p className={styles.body}>{c.lifeBody}</p>
          </ChinaReveal>
          <div className={styles.gallery}>
            {photographs.map((photo, index) => (
              <ChinaReveal
                key={photo.src}
                className={
                  index === 0 ? styles.galleryMain : styles.gallerySmall
                }
                delay={index * 80}
              >
                <figure className={styles.galleryPhoto}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes={
                      index === 0
                        ? "(max-width: 760px) 100vw, 62vw"
                        : "(max-width: 760px) 50vw, 32vw"
                    }
                  />
                  <figcaption>
                    <span>{c.lifeLabels[index]}</span>
                    <strong>{photo.location}</strong>
                  </figcaption>
                </figure>
              </ChinaReveal>
            ))}
          </div>
          <ChinaReveal className={styles.practical}>
            <h3>{c.practicalTitle}</h3>
            <div>
              {c.practical.map(([title, body]) => (
                <div key={title}>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <a
              href="https://iso.hust.edu.cn/Services_Information/Campus_Facilities/Housing___Dining.htm"
              target="_blank"
              rel="noreferrer"
              className={styles.sourceLink}
            >
              {bn
                ? "HUST-এর আবাসন ও খাবারের তথ্য"
                : "HUST housing and dining information"}
            </a>
          </ChinaReveal>
        </PageShell>
      </section>
      <section id="universities" className={styles.section}>
        <PageShell>
          <ChinaReveal className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>{c.ranksEyebrow}</p>
              <h2 className={styles.title}>{c.ranksTitle}</h2>
            </div>
            <p className={styles.body}>{c.ranksBody}</p>
          </ChinaReveal>
          <div className={styles.rankingMeta}>
            <span>QS World University Rankings {chinaRankingEdition}</span>
            <span>
              {bn ? "যাচাই: " : "Checked "}
              <time dateTime={chinaRankingsCheckedOn}>{checked}</time>
            </span>
          </div>
          <ul className={styles.rankings}>
            {chinaRankingExamples.map((university, index) => (
              <li key={university.id}>
                <ChinaReveal className={styles.rankCard} delay={index * 45}>
                  <div className={styles.rankTop}>
                    <span>{university.city}</span>
                    <span>{c.worldRank}</span>
                  </div>
                  <div className={styles.rankNumber}>
                    {number(university.rank)}
                    {university.tied ? <span>{c.tied}</span> : null}
                  </div>
                  <h3>{university.name}</h3>
                  <Link
                    href={href(
                      "/programs?country=china&university=" + university.id,
                    )}
                    className={styles.rankCta}
                  >
                    {c.viewOffers}
                  </Link>
                  <a
                    href={university.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.sourceLink}
                  >
                    {c.rankSource}
                    <span className="sr-only">: {university.name}</span>
                  </a>
                </ChinaReveal>
              </li>
            ))}
          </ul>
          <Link href={explore} className={styles.secondary}>
            {c.allUniversities}
          </Link>
        </PageShell>
      </section>
      <section id="scholarships" className={styles.funding}>
        <PageShell className={styles.fundingGrid}>
          <ChinaReveal>
            <p className={styles.eyebrow}>{c.fundingEyebrow}</p>
            <h2 className={styles.title}>{c.fundingTitle}</h2>
            <p className={styles.body}>{c.fundingBody}</p>
            <Link
              href={href("/programs?country=china&scholarship=1")}
              className={styles.primary}
            >
              {c.fundingCta}
            </Link>
            <Link
              href={href("/cost-calculator?destination=china")}
              className={styles.costLink}
            >
              {c.costCta}
            </Link>
          </ChinaReveal>
          <ChinaReveal className={styles.fundingDetails}>
            {c.awards.map(([title, body]) => (
              <div className={styles.award} key={title}>
                <Check size={21} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
            <p className={styles.fundingNote}>{c.fundingNote}</p>
            <a
              className={styles.sourceLink}
              href="https://www.campuschina.org/"
              target="_blank"
              rel="noreferrer"
            >
              {bn
                ? "Chinese Government Scholarship সম্পর্কে জানুন"
                : "About the Chinese Government Scholarship"}
            </a>
          </ChinaReveal>
        </PageShell>
      </section>
      <section id="intakes" className={styles.section}>
        <PageShell>
          <ChinaReveal className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>{c.routesEyebrow}</p>
              <h2 className={styles.title}>{c.routesTitle}</h2>
            </div>
            <p className={styles.body}>{c.routesBody}</p>
          </ChinaReveal>
          <div className={styles.intakes}>
            {(
              [
                ["March 2027", c.springLabel, c.springBody],
                ["September 2027", c.autumnLabel, c.autumnBody],
              ] as const
            ).map(([intake, label, body], index) => (
              <ChinaReveal
                key={intake}
                className={styles.intakeCard}
                delay={index * 90}
              >
                <p className={styles.eyebrow}>{label}</p>
                <h3>{intake}</h3>
                <p>{body}</p>
                <Link
                  className={styles.primary}
                  href={href(
                    "/programs?country=china&intake=" +
                      encodeURIComponent(intake),
                  )}
                >
                  {c.intakeCta}
                </Link>
              </ChinaReveal>
            ))}
          </div>
          <ChinaReveal className={styles.otherIntakes}>
            <p>{c.pending}</p>
            <div>
              <Link
                href={href(
                  "/programs?country=china&intake=" +
                    encodeURIComponent("Rolling enrollment"),
                )}
              >
                {c.rolling}
              </Link>
              <Link
                href={href(
                  "/programs?country=china&intake=" +
                    encodeURIComponent("Intake to be confirmed"),
                )}
              >
                {c.unconfirmed}
              </Link>
            </div>
          </ChinaReveal>
          <ChinaReveal className={styles.csca}>
            <BookOpen size={25} aria-hidden="true" />
            <div>
              <h3>{c.csca}</h3>
              <p>{c.cscaBody}</p>
            </div>
            <Link href={assessment}>{c.assessment}</Link>
          </ChinaReveal>
        </PageShell>
      </section>
      <section className={styles.faq}>
        <PageShell className={styles.faqGrid}>
          <ChinaReveal>
            <p className={styles.eyebrow}>{c.faqEyebrow}</p>
            <h2 className={styles.title}>{c.faqTitle}</h2>
          </ChinaReveal>
          <div>
            {c.questions.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={22} aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </PageShell>
      </section>
      <section className={styles.support}>
        <PageShell className={styles.supportGrid}>
          <ChinaReveal>
            <p className={styles.eyebrow}>{c.supportEyebrow}</p>
            <h2 className={styles.title}>{c.supportTitle}</h2>
            <p className={styles.body}>{c.supportBody}</p>
            <div className={styles.actions}>
              <Link href={assessment} className={styles.primary}>
                {c.assessment}
              </Link>
              <Link href={explore} className={styles.lightLink}>
                {c.explore}
              </Link>
            </div>
            <p className={styles.reassurance}>{c.reassurance}</p>
          </ChinaReveal>
          <figure className={styles.supportPhoto}>
            <Image
              src="/images/china-xiamen-campus.webp"
              alt={photographs[0].alt}
              fill
              sizes="(max-width: 760px) 100vw, 40vw"
            />
            <figcaption>Xiamen University · Fujian</figcaption>
          </figure>
        </PageShell>
      </section>
      <div id="china-photo-credits" className={styles.credits}>
        <PageShell>
          <details>
            <summary>{c.photoCredits}</summary>
            <p>{c.photoNote}</p>
            <ul>
              {photographs.map((photo) => (
                <li key={photo.src}>
                  <a href={photo.source} target="_blank" rel="noreferrer">
                    {photo.location}
                  </a>{" "}
                  — {photo.author},{" "}
                  <a href={photo.license} target="_blank" rel="noreferrer">
                    {photo.licenseName}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </PageShell>
      </div>
    </div>
  );
}
