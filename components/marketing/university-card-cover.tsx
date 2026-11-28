"use client";

import Image from "next/image";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import type { DestinationSlug } from "@/lib/destinations";
import type { UniversityVisual } from "@/lib/university-visuals";
import { CountryFlagBadge } from "./destination-watermarks";
import styles from "./university-card.module.css";

function universityMonogram(name: string) {
  const abbreviation =
    name.match(/\(([A-Z][A-Za-z]{1,5})\)/)?.[1] ??
    name.match(/^[A-Z][A-Z0-9]{1,6}\b/)?.[0];
  if (abbreviation) return abbreviation;

  const words = name.replace(/[,/].*$/, "").split(/\s+/);
  const significant = words.filter(
    (word) => !/^(of|and|the|university|college)$/i.test(word),
  );
  return (significant.length > 1 ? significant : words)
    .filter((word) => !/^(of|and|the)$/i.test(word))
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function UniversityCardCover({
  name,
  country,
  countryCode,
  locale,
  photo,
  campusPhoto,
  index,
}: {
  name: string;
  country: string;
  countryCode: string;
  locale: string;
  photo?: UniversityVisual;
  campusPhoto: boolean;
  index: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = universityMonogram(name);
  const bn = locale === "bn";
  const flagSlug = countryCode.replace("_", "-");
  const hasFlag = ["malaysia", "china", "south-korea", "india"].includes(
    flagSlug,
  );

  return (
    <div className={styles.cover}>
      {photo && !imageFailed ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className={styles.coverImage}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className={styles.artwork} aria-hidden="true">
          <span>{initials}</span>
          <GraduationCap size={100} strokeWidth={0.6} />
        </div>
      )}
      <div className={styles.coverShade} />
      <span className={styles.edition} aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
        <span />
        {bn ? "আপনার পরবর্তী অধ্যায়" : "YOUR NEXT CHAPTER"}
      </span>
      <div className={styles.seal} aria-hidden="true">
        <span className={styles.monogram}>
          <GraduationCap size={16} strokeWidth={1.3} />
          <span>{initials}</span>
        </span>
      </div>
      <div className={styles.coverLocation}>
        <span className={styles.coverLabel}>
          {hasFlag ? (
            <CountryFlagBadge slug={flagSlug as DestinationSlug} />
          ) : null}
          {country}
        </span>
        {photo && !imageFailed && !campusPhoto ? (
          <span className={styles.photoType}>
            {bn ? "দেশের ঝলক" : "Destination preview"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
