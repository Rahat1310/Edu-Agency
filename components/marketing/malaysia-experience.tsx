"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";
import styles from "./malaysia-destination-page.module.css";

/** Small client enhancements around server-rendered destination content. */
export function MalaysiaExperience({
  children,
  className,
  locale,
}: {
  children: ReactNode;
  className: string;
  locale: Locale;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = root.current;
    const header = document.querySelector(".public-site > header");
    if (!element || !header) return;
    const update = () => {
      element.style.setProperty(
        "--header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const sections = [
      ...element.querySelectorAll<HTMLElement>("[data-guide-section]"),
    ];
    const links = [
      ...element.querySelectorAll<HTMLAnchorElement>("[data-guide-link]"),
    ];
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerHeight =
        Number.parseFloat(element.style.getPropertyValue("--header-height")) ||
        84;
      const current =
        sections
          .filter(
            (section) =>
              section.getBoundingClientRect().top <= headerHeight + 145,
          )
          .at(-1) ?? sections[0];
      links.forEach((link) => {
        if (link.hash === `#${current?.id}`)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const element = root.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || paused || preference.matches) return;

    const counters = [
      ...element.querySelectorAll<HTMLElement>("[data-count-value]"),
    ];
    const frames = new Set<number>();
    const format = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-GB");
    const finish = () => {
      frames.forEach(cancelAnimationFrame);
      frames.clear();
      counters.forEach((counter) => {
        counter.textContent = format.format(Number(counter.dataset.countValue));
      });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const counter = entry.target as HTMLElement;
          observer.unobserve(counter);
          if (counter.dataset.counted) return;
          counter.dataset.counted = "true";
          const value = Number(counter.dataset.countValue);
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / 1400, 1);
            counter.textContent = format.format(
              Math.round(value * (1 - (1 - progress) ** 3)),
            );
            if (progress < 1) {
              const id = requestAnimationFrame((time) => {
                frames.delete(id);
                tick(time);
              });
              frames.add(id);
            }
          };
          tick(start);
        });
      },
      { threshold: 0.8 },
    );
    counters.forEach((counter) => observer.observe(counter));

    const visual = element.querySelector<HTMLElement>("[data-hero-visual]");
    const onMove = (event: PointerEvent) => {
      if (!visual || preference.matches || event.pointerType !== "mouse")
        return;
      const rect = visual.getBoundingClientRect();
      visual.style.setProperty(
        "--tilt-x",
        `${(0.5 - (event.clientY - rect.top) / rect.height) * 4}deg`,
      );
      visual.style.setProperty(
        "--tilt-y",
        `${((event.clientX - rect.left) / rect.width - 0.5) * 4}deg`,
      );
    };
    const reset = () => {
      visual?.style.setProperty("--tilt-x", "0deg");
      visual?.style.setProperty("--tilt-y", "0deg");
    };
    const onPreference = () => {
      if (preference.matches) {
        finish();
        reset();
      }
    };
    visual?.addEventListener("pointermove", onMove);
    visual?.addEventListener("pointerleave", reset);
    preference.addEventListener("change", onPreference);
    return () => {
      observer.disconnect();
      finish();
      reset();
      visual?.removeEventListener("pointermove", onMove);
      visual?.removeEventListener("pointerleave", reset);
      preference.removeEventListener("change", onPreference);
    };
  }, [locale, paused]);

  return (
    <div
      ref={root}
      className={className}
      data-motion={paused ? "paused" : "running"}
    >
      <button
        type="button"
        className={styles.motionControl}
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        {paused ? (
          <Play size={12} aria-hidden="true" />
        ) : (
          <Pause size={12} aria-hidden="true" />
        )}
        {locale === "bn"
          ? paused
            ? "অ্যানিমেশন চালু করুন"
            : "অ্যানিমেশন থামান"
          : paused
            ? "Resume motion"
            : "Pause motion"}
      </button>
      {children}
    </div>
  );
}

type Pathway = {
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  options: { label: string; href: string }[];
};

export function MalaysiaPathways({
  items,
  label,
}: {
  items: Pathway[];
  label: string;
}) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<HTMLDivElement>(null);
  return (
    <div className={styles.pathwayExplorer}>
      <div
        ref={tabs}
        role="tablist"
        aria-label={label}
        className={styles.pathwayTabs}
      >
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            id={`malaysia-pathway-tab-${index}`}
            aria-controls={`malaysia-pathway-panel-${index}`}
            aria-selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % items.length
                  : event.key === "ArrowLeft"
                    ? (index - 1 + items.length) % items.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? items.length - 1
                        : null;
              if (next === null) return;
              event.preventDefault();
              setSelected(next);
              tabs.current
                ?.querySelectorAll<HTMLButtonElement>("button")
                [next]?.focus();
            }}
          >
            <span aria-hidden="true">0{index + 1}</span>
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.label}
          role="tabpanel"
          id={`malaysia-pathway-panel-${index}`}
          aria-labelledby={`malaysia-pathway-tab-${index}`}
          hidden={index !== selected}
          tabIndex={0}
          className={styles.pathwayPanel}
        >
          <div>
            <p className={styles.pathwayEyebrow}>{item.eyebrow}</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
          <div className={styles.pathwayOptions}>
            {item.options.map((option) => (
              <Link key={option.href} href={option.href}>
                {option.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
