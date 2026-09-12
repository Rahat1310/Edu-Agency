import { desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import { successStories, type ProgramCountry } from "@/db/schema";
import {
  SUCCESS_STORIES_CACHE_TAG,
  SUCCESS_STORIES_REVALIDATE_SECONDS,
} from "@/lib/success-stories/constants";
import {
  filterStoriesByDestination,
  type PublicSuccessStory,
  type SuccessStoryView,
} from "@/lib/success-stories/featured";
import { marketingAssetUrl } from "@/lib/success-stories/photo";

const publicColumns = {
  id: successStories.id,
  studentName: successStories.studentName,
  destination: successStories.destination,
  university: successStories.university,
  program: successStories.program,
  photoR2Key: successStories.photoR2Key,
  quote: successStories.quote,
  createdAt: successStories.createdAt,
};

async function queryPublishedSuccessStories(): Promise<PublicSuccessStory[]> {
  return db
    .select(publicColumns)
    .from(successStories)
    .where(eq(successStories.isPublished, true))
    .orderBy(desc(successStories.createdAt));
}

export function listPublishedSuccessStories() {
  return unstable_cache(
    queryPublishedSuccessStories,
    ["success-stories-published"],
    {
      tags: [SUCCESS_STORIES_CACHE_TAG],
      revalidate: SUCCESS_STORIES_REVALIDATE_SECONDS,
    },
  )();
}

export async function loadPublishedSuccessStories(
  destination: ProgramCountry | "" = "",
): Promise<SuccessStoryView[]> {
  try {
    const rows = await listPublishedSuccessStories();
    return filterStoriesByDestination(rows, destination).map((story) => ({
      ...story,
      photoUrl: marketingAssetUrl(story.photoR2Key),
    }));
  } catch {
    return [];
  }
}
