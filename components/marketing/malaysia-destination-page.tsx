import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  GraduationCap,
  Languages,
  MapPin,
  MessageCircle,
  Plane,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { ChinaReveal as Reveal } from "@/components/marketing/china-reveal";
import {
  MalaysiaExperience,
  MalaysiaPathways,
} from "@/components/marketing/malaysia-experience";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { malaysiaInstitutions, malaysiaProgrammes } from "@/lib/malaysia";
import { malaysiaDestinationCopy } from "@/lib/malaysia/destination-copy";
import base from "./china-destination-page.module.css";
import styles from "./malaysia-destination-page.module.css";

const photographs = [
  {
    src: "/images/malaysia-sunway-campus.webp",
    location: "Sunway University · Bandar Sunway",
    alt: "Sunway University’s campus entrance, landscaped grounds and distinctive curved building",
    source:
      "https://commons.wikimedia.org/wiki/File:Cmglee_Sunway_University_new_building.jpg",
    author: "Cmglee",
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    licenseName: "CC BY-SA 4.0",
  },
  {
    src: "/images/malaysia-kuala-lumpur.webp",
    location: "Kuala Lumpur · Malaysia",
    alt: "The illuminated Petronas Twin Towers and Kuala Lumpur skyline at night",
    source:
      "https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_skyline_at_night.jpg",
    author: "Lah sadzik",
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    licenseName: "CC BY-SA 4.0",
  },
  {
    src: "/images/malaysia-george-town.webp",
    location: "George Town · Penang",
    alt: "Colourful heritage shophouses along a street in George Town, Penang",
    source:
      "https://commons.wikimedia.org/wiki/File:Street_in_George_Town_-_Penang.jpg",
    author: "Christophe95",
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    licenseName: "CC BY-SA 4.0",
  },
] as const;

const heroPhotograph = {
  src: "/images/malaysia-kuala-lumpur-hero.webp",
  location: "Petronas Twin Towers & KLCC Park",
  alt: "The illuminated Petronas Twin Towers reflected in the lake at KLCC Park",
  source:
    "https://commons.wikimedia.org/wiki/File:The_Petronas_Twin_Towers_%26_KLCC_Park.jpg",
  author: "Ahmad Rithauddin",
  license: "https://creativecommons.org/licenses/by/2.0/",
  licenseName: "CC BY 2.0",
};

const featuredIds = ["sunway", "apu", "taylors", "inti", "uow", "mmu"];
const institutionIds = new Set(
  malaysiaInstitutions
    .filter(
      (institution) =>
        institution.kind === "university" || institution.kind === "group",
    )
    .map((institution) => institution.id),
);
const programmes = malaysiaProgrammes.filter((programme) =>
  institutionIds.has(programme.institutionId),
);
const institutions = malaysiaInstitutions.filter(
  (institution) =>
    institutionIds.has(institution.id) &&
    programmes.some((programme) => programme.institutionId === institution.id),
);
const sections = [
  "why-malaysia",
  "campus-life",
  "universities",
  "pathways",
  "your-budget",
  "visa-arrival",
];
const pathwayLevels = [
  ["foundation", "diploma", "bachelor"],
  ["master", "phd"],
  ["language"],
];

export function MalaysiaDestinationPage({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const bn = locale === "bn";
  const c = malaysiaDestinationCopy(locale);
  const href = (path: string) => localizedHref(path, locale);
  const explore = href("/programs?country=malaysia");
  const assessment = href("/consultation?destination=malaysia");
  const number = (value: number) =>
    new Intl.NumberFormat(bn ? "bn-BD" : "en-GB").format(value);
  const reasonIcons = [GraduationCap, Compass, Wallet];
  const budgetIcons = [BookOpen, MapPin, Plane];

  return (
    <MalaysiaExperience
      locale={locale}
      className={`${base.page} ${styles.page}`}
    >
      <section
        className={`${base.hero} ${styles.hero}`}
        aria-labelledby="malaysia-title"
      >
        <div className={styles.heroOrb} aria-hidden="true" />
        <PageShell className={base.heroGrid}>
          <div className={base.heroCopy}>
            <p className={`${base.eyebrow} ${styles.heroEyebrow}`}>
              <span aria-hidden="true">MY</span>
              {c.eyebrow}
            </p>
            <h1
              id="malaysia-title"
              className={`${base.heroTitle} ${styles.heroTitle}`}
            >
              {c.title}
              <span>{c.accent}</span>
            </h1>
            <p className={base.heroIntro}>{c.intro}</p>
            <div className={base.actions}>
              <Link
                href={explore}
                className={`${base.primary} ${styles.primary}`}
              >
                {c.explore}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link href={assessment} className={base.textLink}>
                <MessageCircle size={18} aria-hidden="true" />
                {c.assessment}
              </Link>
            </div>
            <p className={base.reassurance}>
              <Check size={16} aria-hidden="true" />
              {c.reassurance}
            </p>
            <a href="#why-malaysia" className={styles.scrollCue}>
              <ArrowDown size={15} aria-hidden="true" />
              {bn
                ? "আপনার সম্ভাবনাগুলো দেখুন"
                : "A little further. A lot to discover."}
            </a>
          </div>
          <div
            className={`${base.heroVisual} ${styles.heroVisual}`}
            data-hero-visual
          >
            <div className={styles.orbit} aria-hidden="true" />
            <figure className={`${base.heroPhoto} ${styles.heroPhoto}`}>
              <Image
                src={heroPhotograph.src}
                alt={
                  bn
                    ? "রাতের আলোয় কুয়ালালামপুর ও পেট্রোনাস টুইন টাওয়ার"
                    : heroPhotograph.alt
                }
                fill
                priority
                sizes="(max-width: 760px) 95vw, 48vw"
              />
              <figcaption>
                <MapPin size={15} aria-hidden="true" />
                {c.heroCaption}
              </figcaption>
            </figure>
            <figure className={`${base.cityPhoto} ${styles.cityPhoto}`}>
              <Image
                src={photographs[0].src}
                alt={
                  bn
                    ? "Sunway University-এর ক্যাম্পাস ও শিক্ষাভবন"
                    : photographs[0].alt
                }
                fill
                sizes="(max-width: 760px) 48vw, 280px"
              />
              <figcaption>Sunway University</figcaption>
            </figure>
            <div className={`${base.heroNote} ${styles.heroNote}`}>
              <Sparkles size={22} aria-hidden="true" />
              <p>{c.heroNote}</p>
            </div>
            <div className={styles.boardingCard} aria-hidden="true">
              <p>{c.boarding}</p>
              <div>
                <span>
                  DAC<small>Dhaka</small>
                </span>
                <div className={styles.flightRoute}>
                  <i />
                  <Plane size={20} />
                  <i />
                </div>
                <span>
                  KUL<small>Kuala Lumpur</small>
                </span>
              </div>
              <div className={styles.boardingFooter}>
                <span>YOUR FUTURE AWAITS</span>
                <span className={styles.barcode} />
              </div>
            </div>
          </div>
        </PageShell>
        <PageShell>
          <dl className={`${base.stats} ${styles.stats}`}>
            {[
              [programmes.length, c.programmeCount],
              [institutions.length, c.institutionCount],
            ].map(([value, label]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  <span data-count-value={value} aria-hidden="true">
                    {number(Number(value))}
                  </span>
                  <span className="sr-only">{number(Number(value))}</span>
                </dd>
              </div>
            ))}
            <div>
              <dt>{c.personal}</dt>
              <dd>1:1</dd>
            </div>
          </dl>
        </PageShell>
      </section>

      <nav
        className={`${base.sectionNav} ${styles.sectionNav}`}
        aria-label={
          bn ? "মালয়েশিয়ায় পড়াশোনার গাইড" : "Explore the Malaysia guide"
        }
      >
        <PageShell className={`${base.navInner} ${styles.navInner}`}>
          {c.nav.map((label, index) => (
            <a key={label} href={`#${sections[index]}`} data-guide-link>
              {label}
            </a>
          ))}
        </PageShell>
      </nav>

      <section id="why-malaysia" data-guide-section className={base.section}>
        <PageShell className={base.whyGrid}>
          <Reveal>
            <p className={base.eyebrow}>{c.whyEyebrow}</p>
            <h2 className={base.title}>{c.whyTitle}</h2>
            <p className={base.body}>{c.whyBody}</p>
            <div className={base.personalNote}>
              <p>{c.note}</p>
              <span>{c.noteBody}</span>
            </div>
          </Reveal>
          <div className={base.reasons}>
            {c.reasons.map(([title, body], index) => {
              const Icon = reasonIcons[index] ?? GraduationCap;
              return (
                <Reveal key={title} delay={index * 85}>
                  <div className={`${base.reason} ${styles.reason}`}>
                    <span className={base.icon}>
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </PageShell>
      </section>

      <section
        id="campus-life"
        data-guide-section
        className={`${base.life} ${styles.life}`}
      >
        <PageShell>
          <Reveal className={base.sectionHeading}>
            <div>
              <p className={base.eyebrow}>{c.lifeEyebrow}</p>
              <h2 className={base.title}>{c.lifeTitle}</h2>
            </div>
            <p className={base.body}>{c.lifeBody}</p>
          </Reveal>
          <div className={base.gallery}>
            {photographs.map((photo, index) => (
              <Reveal
                key={photo.src}
                className={index === 0 ? base.galleryMain : base.gallerySmall}
                delay={index * 90}
              >
                <a
                  href={photo.src}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${bn ? "ছবি দেখুন" : "View photograph"}: ${photo.location} (${bn ? "নতুন ট্যাবে খুলবে" : "opens in a new tab"})`}
                  className={styles.galleryLink}
                >
                  <figure
                    className={`${base.galleryPhoto} ${styles.galleryPhoto}`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes={
                        index === 0
                          ? "(max-width: 760px) 100vw, 60vw"
                          : "(max-width: 760px) 50vw, 32vw"
                      }
                    />
                    <figcaption>
                      <span>{c.lifeLabels[index]}</span>
                      <strong>{photo.location}</strong>
                    </figcaption>
                    <span className={styles.galleryArrow} aria-hidden="true">
                      <ArrowUpRight size={22} />
                    </span>
                  </figure>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal className={base.practical}>
            <h3>{c.practicalTitle}</h3>
            <div>
              {c.practical.map(([title, body]) => (
                <div key={title}>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <Link
              href={href("/destinations/malaysia/pre-departure")}
              className={base.sourceLink}
            >
              {c.arrival}
            </Link>
          </Reveal>
        </PageShell>
      </section>

      <section id="universities" data-guide-section className={base.section}>
        <PageShell>
          <Reveal className={base.sectionHeading}>
            <div>
              <p className={base.eyebrow}>{c.universitiesEyebrow}</p>
              <h2 className={base.title}>{c.universitiesTitle}</h2>
            </div>
            <p className={base.body}>{c.universitiesBody}</p>
          </Reveal>
          <div className={styles.universityMeta}>
            <span>{c.catalogueLabel}</span>
            <span>
              <span className={styles.statusDot} aria-hidden="true" />
              {bn
                ? "প্রোগ্রাম থেকে নিজের তালিকা তৈরি করুন"
                : "Find a course. Make it your own."}
            </span>
          </div>
          <ul className={styles.universities}>
            {featuredIds.map((id, index) => {
              const institution = malaysiaInstitutions.find(
                (item) => item.id === id,
              );
              if (!institution) return null;
              const count = programmes.filter(
                (programme) => programme.institutionId === id,
              ).length;
              return (
                <li key={id}>
                  <Reveal
                    delay={index * 55}
                    className={styles.universityReveal}
                  >
                    <Link
                      href={href(`/destinations/malaysia/universities/${id}`)}
                      className={styles.universityCard}
                    >
                      <div className={styles.universityTop}>
                        <span className={styles.monogram}>
                          {id === "taylors"
                            ? "T’s"
                            : id === "sunway"
                              ? "SU"
                              : id.toUpperCase()}
                        </span>
                        <ArrowUpRight size={22} aria-hidden="true" />
                      </div>
                      <p className={styles.universityTag}>
                        {c.universityTags[index]}
                      </p>
                      <h3>{institution.name}</h3>
                      <p className={styles.universityCount}>
                        <strong>{number(count)}</strong> {c.programmeLabel}
                      </p>
                      <span className={styles.universityCta}>
                        {c.viewProgrammes}
                        <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
          <Link href={explore} className={base.secondary}>
            {c.allUniversities}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </PageShell>
      </section>

      <section
        id="pathways"
        data-guide-section
        className={`${base.section} ${styles.pathways}`}
      >
        <PageShell>
          <Reveal className={base.sectionHeading}>
            <div>
              <p className={base.eyebrow}>{c.pathwaysEyebrow}</p>
              <h2 className={base.title}>{c.pathwaysTitle}</h2>
            </div>
            <p className={base.body}>{c.pathwaysBody}</p>
          </Reveal>
          <Reveal>
            <MalaysiaPathways
              label={c.pathwaysLabel}
              items={c.pathways.map((item, index) => ({
                ...item,
                options: item.options.map((label, optionIndex) => ({
                  label,
                  href: href(
                    `/programs?country=malaysia&level=${pathwayLevels[index]?.[optionIndex] ?? "bachelor"}`,
                  ),
                })),
              }))}
            />
          </Reveal>
          <p className={styles.pathwayNote}>
            <Languages size={20} aria-hidden="true" />
            {c.pathwayNote}
          </p>
        </PageShell>
      </section>

      <section
        id="your-budget"
        data-guide-section
        className={`${base.funding} ${styles.funding}`}
      >
        <div className={styles.fundingOrb} aria-hidden="true" />
        <PageShell className={base.fundingGrid}>
          <Reveal>
            <p className={base.eyebrow}>{c.fundingEyebrow}</p>
            <h2 className={base.title}>{c.fundingTitle}</h2>
            <p className={base.body}>{c.fundingBody}</p>
            <div className={styles.budgetPills}>
              {c.budgetLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <Link href={explore} className={base.primary}>
              {c.fundingCta}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal className={base.fundingDetails} delay={100}>
            {c.budget.map(([title, body], index) => {
              const Icon = budgetIcons[index] ?? Wallet;
              return (
                <div className={base.award} key={title}>
                  <Icon size={22} aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </div>
              );
            })}
            <p className={base.fundingNote}>{c.fundingNote}</p>
          </Reveal>
        </PageShell>
      </section>

      <section
        id="visa-arrival"
        data-guide-section
        className={`${base.section} ${styles.visaSection}`}
      >
        <PageShell>
          <Reveal className={base.sectionHeading}>
            <div>
              <p className={base.eyebrow}>{c.visaEyebrow}</p>
              <h2 className={base.title}>{c.visaTitle}</h2>
            </div>
            <p className={base.body}>{c.visaBody}</p>
          </Reveal>
          <ol className={styles.journey}>
            {c.visaSteps.map(([title, body], index) => (
              <li key={title}>
                <Reveal delay={index * 100} className={styles.journeyStep}>
                  <span className={styles.stepNumber}>{number(index + 1)}</span>
                  <span className={styles.stepLabel}>STEP 0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className={styles.visaLinks}>
            <a
              href="https://www.imi.gov.my/index.php/en/main-services/pass/student-pass/"
              target="_blank"
              rel="noreferrer"
            >
              {c.officialVisa}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <Link href={href("/destinations/malaysia/pre-departure")}>
              {c.arrival}
              <Plane size={17} aria-hidden="true" />
            </Link>
          </div>
        </PageShell>
      </section>

      <section className={`${base.faq} ${styles.faq}`}>
        <PageShell className={base.faqGrid}>
          <Reveal>
            <p className={base.eyebrow}>{c.faqEyebrow}</p>
            <h2 className={base.title}>{c.faqTitle}</h2>
            <div className={styles.faqIllustration} aria-hidden="true">
              <MessageCircle size={48} strokeWidth={1.1} />
              <span>hello, future.</span>
              <Sparkles size={23} />
            </div>
          </Reveal>
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

      <section className={`${base.support} ${styles.support}`}>
        <PageShell className={base.supportGrid}>
          <Reveal>
            <p className={base.eyebrow}>{c.supportEyebrow}</p>
            <h2 className={base.title}>{c.supportTitle}</h2>
            <p className={base.body}>{c.supportBody}</p>
            <div className={base.actions}>
              <Link href={assessment} className={base.primary}>
                {c.assessment}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link href={explore} className={base.lightLink}>
                {c.explore}
              </Link>
            </div>
            <p className={base.reassurance}>
              <Check size={16} aria-hidden="true" />
              {c.reassurance}
            </p>
          </Reveal>
          <Reveal className={styles.supportVisual}>
            <figure className={base.supportPhoto}>
              <Image
                src={photographs[2].src}
                alt={photographs[2].alt}
                fill
                sizes="(max-width: 760px) 100vw, 40vw"
              />
              <figcaption>{photographs[2].location}</figcaption>
            </figure>
            <div className={styles.postcardStamp} aria-hidden="true">
              <Compass size={30} />
              <span>
                GO FIND
                <br />
                YOUR NEXT.
              </span>
            </div>
          </Reveal>
        </PageShell>
      </section>
      <PageShell>
        <div className={styles.otherDestinations}>
          <p>{c.moreDestinations}</p>
          <div>
            {(["china", "india", "south-korea"] as const).map((slug) => (
              <Link key={slug} href={href(`/destinations/${slug}`)}>
                {dict.destinations[slug].name}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </PageShell>
      <div className={base.credits}>
        <PageShell>
          <details>
            <summary>{c.photoCredits}</summary>
            <p>{c.photoNote}</p>
            <ul>
              {[...photographs, heroPhotograph].map((photo) => (
                <li key={photo.src}>
                  <a href={photo.source} target="_blank" rel="noreferrer">
                    {photo.location}
                  </a>{" "}
                  — {photo.author},{" "}
                  <a href={photo.license} target="_blank" rel="noreferrer">
                    {photo.licenseName}
                  </a>{" "}
                  ·{" "}
                  <a href={photo.src} download>
                    {bn ? "ওয়েব সংস্করণ" : "Web adaptation"}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </PageShell>
      </div>
    </MalaysiaExperience>
  );
}
