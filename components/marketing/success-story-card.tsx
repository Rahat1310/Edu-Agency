import Link from "next/link";

import { DESTINATIONS, destinationSlugFromCountry } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import type { SuccessStoryView } from "@/lib/success-stories/featured";

type SuccessStoryCardProps = {
  story: SuccessStoryView;
  dict: Dictionary;
  locale: Locale;
};

export function SuccessStoryCard({
  story,
  dict,
  locale,
}: SuccessStoryCardProps) {
  const slug = destinationSlugFromCountry(story.destination);
  const destinationName = dict.destinations[slug].name;
  const destinationHref = localizedHref(`/destinations/${slug}`, locale);
  const initial =
    story.studentName.trim().charAt(0).toUpperCase() ||
    destinationName.charAt(0);

  return (
    <article className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-2xs transition-all hover:shadow-md">
      <div className="flex items-start gap-3.5">
        {story.photoUrl ? (
          // Public marketing CDN — not next/image, so a custom R2 domain works without a rebuild.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.photoUrl}
            alt=""
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full object-cover ring-2 ring-stone-100"
          />
        ) : (
          <span
            className="font-heading grid size-14 shrink-0 place-items-center rounded-full border border-orange-200 bg-orange-50 text-lg font-bold text-orange-700"
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-slate-900">
            {story.studentName}
          </p>
          <p className="text-sm font-medium text-slate-500">{story.program}</p>
          <p className="text-xs text-slate-400">{story.university}</p>
        </div>
      </div>
      <blockquote className="mt-5 flex-1 text-[0.95rem] leading-7 text-slate-700">
        “{story.quote}”
      </blockquote>
      <p className="mt-5 border-t border-stone-100 pt-3">
        <Link
          href={destinationHref}
          className="focus-ring inline-flex items-center text-xs font-bold tracking-wider text-orange-600 uppercase hover:text-orange-700"
        >
          <span
            className="mr-2 inline-block size-2 rounded-full align-middle"
            style={{ backgroundColor: DESTINATIONS[slug].color }}
            aria-hidden="true"
          />
          {destinationName} →
        </Link>
      </p>
    </article>
  );
}
