import Image from "next/image";
import Link from "next/link";
import { Building2, CircleAlert } from "lucide-react";
import { getChinaOffer } from "@/lib/china-2027";
import { ProgramCompareCheckbox } from "@/components/marketing/program-compare";
import {
  programCountryText,
  programIntakeText,
  programLevelText,
  programReviewLabels,
} from "@/lib/programs-directory";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import type { PublicProgramCard } from "@/lib/programs-public";
import styles from "./programs-directory.module.css";
import { malaysiaLevelLabel } from "@/lib/malaysia/copy";

type ProgramCardProps = {
  program: PublicProgramCard;
  locale: Locale;
  dict: Dictionary;
};
const campusPhotos: Record<string, { src: string; alt: string }> = {
  "xiamen-university": {
    src: "/images/china-xiamen-campus.webp",
    alt: "Xiamen University campus",
  },
  "huazhong-university-of-science-and-technology": {
    src: "/images/china-hust-campus.jpg",
    alt: "HUST campus in Wuhan",
  },
};

export function ProgramCard({ program, locale }: ProgramCardProps) {
  const offer = getChinaOffer(program.id);
  const bn = locale === "bn";
  const href = localizedHref("/programs/" + program.id, locale);
  const title = program.field.replace(
    /\b(chinese|english)-taught/g,
    (word) => word[0]!.toUpperCase() + word.slice(1),
  );
  const intakes = program.intakeMonths?.filter(Boolean) ?? [];
  const application = offer?.deadlines.find((deadline) =>
    /^Application deadline$/i.test(deadline.label),
  );
  const photo = offer ? campusPhotos[offer.universityId] : undefined;
  const review = offer ? programReviewLabels(offer, locale) : [];
  const majors = offer?.majors ?? [];
  const amount = Number(program.tuitionAmount);
  const price =
    program.tuitionDisplay ??
    offer?.tuition.display ??
    (program.tuitionAmount && Number.isFinite(amount)
      ? program.tuitionCurrency +
        " " +
        new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(
          amount,
        )
      : bn
        ? "ফি নিশ্চিত করতে হবে"
        : "Fee to be confirmed");
  const facts: [string, string][] = [];
  if (offer) {
    facts.push([
      bn ? "পড়ার মাধ্যম" : "Teaching language",
      offer.language === "To be confirmed"
        ? bn
          ? "নিশ্চিত করা বাকি"
          : "To be confirmed"
        : offer.language,
    ]);
    facts.push([bn ? "মেয়াদ" : "Course length", offer.duration]);
  }
  if (intakes.length)
    facts.push([
      bn ? "ক্লাস শুরু" : "Classes start",
      intakes.map((intake) => programIntakeText(intake, locale)).join(" / "),
    ]);
  if (application)
    facts.push([
      bn ? "আবেদন শেষ" : "Apply by",
      application.date
        ? new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(application.date))
        : application.display,
    ]);
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.level}>
          {program.catalogueLevel
            ? malaysiaLevelLabel(program.catalogueLevel, locale)
            : programLevelText(program.level, locale)}
        </span>
        <ProgramCompareCheckbox
          programId={program.id}
          programName={title + " — " + program.universityName}
        />
      </div>
      <h3 className={styles.courseTitle}>{title}</h3>
      <div className={styles.university}>
        <span className={styles.universityImage}>
          {photo ? (
            <Image src={photo.src} alt={photo.alt} fill sizes="48px" />
          ) : (
            <Building2 size={23} aria-hidden="true" />
          )}
        </span>
        <div>
          <p>{program.universityName}</p>
          <span>
            {programCountryText(program.country, locale)}
            {offer?.location ? " · " + offer.location : ""}
          </span>
        </div>
      </div>
      <dl className={styles.facts}>
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {offer?.progressionStart ? (
        <div className={styles.progression}>
          <span>{bn ? "ডিগ্রি শুরু" : "Degree starts"}</span>
          <strong>{offer.progressionStart}</strong>
          <p>
            {bn
              ? "পরের ধাপে যেতে বিশ্ববিদ্যালয়ের শর্ত পূরণ করতে হবে।"
              : "Degree entry has separate requirements."}
          </p>
        </div>
      ) : null}
      {majors.length > 1 ? (
        <p className={styles.subjects}>
          <span>{bn ? "বিষয়" : "Subjects"}</span>
          {majors.slice(0, 2).join(" · ")}
          {majors.length > 2 ? (
            <small>
              {bn
                ? "আরও " + (majors.length - 2) + "টি বিষয়"
                : "and " + (majors.length - 2) + " more"}
            </small>
          ) : null}
        </p>
      ) : null}
      <div className={styles.cardBottom}>
        <div className={styles.price}>
          <p>
            {offer?.tuition.basis === "combined"
              ? bn
                ? "ফি প্যাকেজ"
                : "Fee package"
              : offer?.tuition.basis === "after-scholarship"
                ? bn
                  ? "স্কলারশিপের পরের টিউশন"
                  : "Tuition after scholarship"
                : bn
                  ? "টিউশন"
                  : "Tuition"}
          </p>
          <strong>{price}</strong>
          {!offer ? (
            <span>
              {bn
                ? "ফি কোন মেয়াদের জন্য এবং কী অন্তর্ভুক্ত, তা নিশ্চিত করুন।"
                : "Confirm the fee period and what it includes."}
            </span>
          ) : offer.tuition.basis === "after-scholarship" ? (
            <span>
              {bn
                ? "লিখিত অ্যাওয়ার্ডের শর্ত প্রযোজ্য।"
                : "Subject to a written scholarship award."}
            </span>
          ) : null}
        </div>
        {offer ? (
          <div
            className={
              offer.scholarship.available
                ? styles.scholarship
                : styles.selfFunded
            }
          >
            <span>{bn ? "স্কলারশিপ" : "Scholarship"}</span>
            <p>
              {offer.scholarship.available
                ? offer.scholarship.summary
                : bn
                  ? "এই অফারে স্কলারশিপের তথ্য নেই।"
                  : "No scholarship listed for this offer."}
            </p>
          </div>
        ) : null}
        {offer?.eligibility === "unavailable" ? (
          <p className={styles.unavailable}>
            <CircleAlert size={16} aria-hidden="true" />
            {bn
              ? "বাংলাদেশি আবেদনকারীদের জন্য এই অফার উন্মুক্ত নয়।"
              : "This offer is not open to applicants from Bangladesh."}
          </p>
        ) : review.length ? (
          <div className={styles.review}>
            <CircleAlert size={16} aria-hidden="true" />
            <p>{review.join(" · ")}</p>
          </div>
        ) : null}
        <div className={styles.cardFooter}>
          <Link href={href} className={styles.detailsLink}>
            {bn ? "কোর্সের বিস্তারিত দেখুন" : "View course details"}
            <span className="sr-only">
              : {title}, {program.universityName}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
