"use client";

import { useRef, useState, type ReactNode } from "react";
import { Dialog } from "radix-ui";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  MapPin,
  X,
} from "lucide-react";
import type { UniversityVisual } from "@/lib/university-visuals";
import { UniversityCardCover } from "./university-card-cover";
import { UniversityPhotoCredit } from "./university-photo-credit";
import styles from "./university-card.module.css";

type UniversityCardProps = {
  name: string;
  country: string;
  countryCode: string;
  locale: string;
  count: number;
  levels: string[];
  keywords: string[];
  photo?: UniversityVisual;
  campusPhoto: boolean;
  index: number;
  children: ReactNode;
};

export function UniversityCard({
  name,
  country,
  countryCode,
  locale,
  count,
  levels,
  keywords,
  photo,
  campusPhoto,
  index,
  children,
}: UniversityCardProps) {
  const bn = locale === "bn";
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const number = (value: number) =>
    new Intl.NumberFormat(bn ? "bn-BD" : "en-GB").format(value);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && document.activeElement instanceof HTMLElement) {
          opener.current = document.activeElement;
        }
        setOpen(nextOpen);
      }}
    >
      <motion.li
        className={styles.card}
        data-country={countryCode}
        data-university-card
        initial={false}
        whileInView={
          reducedMotion ? undefined : { opacity: [0, 1], y: [18, 0] }
        }
        viewport={{ once: true, amount: 0.12 }}
        transition={{
          duration: 0.5,
          delay: (index % 3) * 0.07,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className={styles.media}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className={styles.coverButton}
              aria-label={(bn ? "বিশ্ববিদ্যালয় দেখুন: " : "Discover ") + name}
            >
              <UniversityCardCover
                name={name}
                country={country}
                countryCode={countryCode}
                locale={locale}
                photo={photo}
                campusPhoto={campusPhoto}
                index={index}
              />
            </button>
          </Dialog.Trigger>
          <UniversityPhotoCredit photo={photo} />
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>
            <Dialog.Trigger className={styles.titleButton}>
              {name}
            </Dialog.Trigger>
          </h3>
          <div
            className={styles.keywords}
            aria-label={bn ? "পড়ার বিষয়" : "Available areas of study"}
          >
            {keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
          <div className={styles.facts}>
            <div>
              <BookOpen size={17} strokeWidth={1.6} aria-hidden="true" />
              <p>
                <strong>{number(count)}</strong>
                <span>
                  {bn ? "টি প্রোগ্রাম" : count === 1 ? "program" : "programs"}
                </span>
              </p>
            </div>
            <div>
              <GraduationCap size={19} strokeWidth={1.6} aria-hidden="true" />
              <p>
                <span className={styles.factLabel}>
                  {bn ? "শিক্ষাস্তর" : "Study levels"}
                </span>
                <strong className={styles.levelNames}>
                  {levels.join(" · ")}
                </strong>
              </p>
            </div>
          </div>
          <Dialog.Trigger
            className={styles.explore}
            aria-label={
              (bn
                ? "প্রোগ্রাম ও ফি দেখুন: "
                : "Explore programs and fees at ") + name
            }
          >
            <span>{bn ? "প্রোগ্রাম ও ফি দেখুন" : "Explore programs"}</span>
            <span className={styles.arrow}>
              <ArrowUpRight size={21} strokeWidth={1.7} aria-hidden="true" />
            </span>
          </Dialog.Trigger>
        </div>
      </motion.li>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.panel}
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            if (opener.current?.isConnected) {
              event.preventDefault();
              opener.current.focus();
            }
          }}
        >
          <header className={styles.panelHeader}>
            <span className={styles.panelEyebrow}>
              <MapPin size={14} aria-hidden="true" />
              {country}
            </span>
            <Dialog.Title className={styles.panelTitle}>{name}</Dialog.Title>
            <Dialog.Description className={styles.panelDescription}>
              {number(count)}{" "}
              {bn
                ? "টি প্রোগ্রাম · কোর্স বেছে নিয়ে ফি ও ভর্তির তথ্য দেখুন।"
                : "programs · Find your course, check fees and compare your options."}
            </Dialog.Description>
            <div className={styles.panelLevels}>
              {levels.map((level) => (
                <span key={level}>{level}</span>
              ))}
            </div>
            <Dialog.Close
              className={styles.close}
              aria-label={
                bn ? "প্রোগ্রামের তালিকা বন্ধ করুন" : "Close program list"
              }
            >
              <X size={22} />
            </Dialog.Close>
          </header>
          <div className={styles.panelContent}>
            <p className={styles.panelSection}>
              <ArrowDown size={14} aria-hidden="true" />
              {bn ? "আপনার পড়ার পথ খুঁজুন" : "FIND YOUR STUDY PATH"}
            </p>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
