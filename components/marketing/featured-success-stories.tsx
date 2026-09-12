"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SuccessStoryCard } from "@/components/marketing/success-story-card";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import {
  featuredWindowSize,
  rotateStories,
  type SuccessStoryView,
} from "@/lib/success-stories/featured";

const ROTATE_MS = 8000;

type FeaturedSuccessStoriesProps = {
  stories: SuccessStoryView[];
  initialOffset: number;
  locale: Locale;
  dict: Dictionary;
};

export function FeaturedSuccessStories({
  stories,
  initialOffset,
  locale,
  dict,
}: FeaturedSuccessStoriesProps) {
  const visible = featuredWindowSize(stories.length);
  const canRotate = stories.length > visible;
  const [offset, setOffset] = useState(initialOffset);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!canRotate || reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setOffset((current) => current + 1);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [canRotate, reduceMotion]);

  const shown = rotateStories(
    stories,
    reduceMotion ? initialOffset : offset,
    visible,
  );

  return (
    <div>
      <ul
        className="mt-10 grid gap-5 sm:grid-cols-2"
        aria-live={canRotate && !reduceMotion ? "polite" : undefined}
      >
        {shown.map((story) => (
          <li key={story.id}>
            <SuccessStoryCard story={story} dict={dict} locale={locale} />
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link
          href={localizedHref("/success-stories", locale)}
          className="btn-secondary-glass focus-ring inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-bold text-slate-800 transition-all hover:border-orange-300 hover:bg-white hover:text-orange-600"
        >
          {dict.successStories.seeAll} →
        </Link>
      </p>
    </div>
  );
}
