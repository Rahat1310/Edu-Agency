import { DESTINATIONS, destinationSlugFromCountry } from "@/lib/destinations";
import type { Dictionary } from "@/lib/i18n/types";
import type { PublicSuccessStory } from "@/lib/success-stories/featured";
import { marketingAssetUrl } from "@/lib/success-stories/photo";

function storyPhotoUrl(story: PublicSuccessStory): string | undefined {
  return marketingAssetUrl(story.photoR2Key) ?? undefined;
}

export function successStoryReviewJsonLd(
  story: PublicSuccessStory,
  dict: Dictionary,
  siteUrl: string,
) {
  const slug = destinationSlugFromCountry(story.destination);
  const countryCode = DESTINATIONS[slug].code;
  const image = storyPhotoUrl(story);

  return {
    "@type": "Review" as const,
    author: {
      "@type": "Person" as const,
      name: story.studentName,
    },
    reviewBody: story.quote,
    datePublished: story.createdAt ? new Date(story.createdAt).toISOString() : undefined,
    itemReviewed: {
      "@type": "CollegeOrUniversity" as const,
      name: story.university,
      address: {
        "@type": "PostalAddress" as const,
        addressCountry: countryCode,
      },
    },
    publisher: {
      "@type": "Organization" as const,
      name: dict.meta.siteName,
      url: siteUrl,
    },
    ...(image ? { image } : {}),
  };
}

export function successStoriesItemListJsonLd(
  stories: readonly PublicSuccessStory[],
  dict: Dictionary,
  siteUrl: string,
  pageUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: dict.successStories.title,
    url: pageUrl,
    itemListElement: stories.map((story, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: successStoryReviewJsonLd(story, dict, siteUrl),
    })),
  };
}
