import { revalidatePath, revalidateTag } from "next/cache";

import { SUCCESS_STORIES_CACHE_TAG } from "@/lib/success-stories/constants";

export function revalidatePublicSuccessStories() {
  revalidateTag(SUCCESS_STORIES_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/bn");
  revalidatePath("/success-stories");
  revalidatePath("/en/success-stories");
  revalidatePath("/bn/success-stories");
}
