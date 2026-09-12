import { revalidatePath, revalidateTag } from "next/cache";

import { DESTINATION_SLUGS } from "@/lib/destinations";
import { INTAKE_DEADLINES_CACHE_TAG } from "@/lib/intakes/constants";

/**
 * Bust the cached deadline rows and the ISR HTML that prints remaining days.
 */
export function revalidateIntakeDeadlines() {
  revalidateTag(INTAKE_DEADLINES_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/bn");

  for (const slug of DESTINATION_SLUGS) {
    revalidatePath(`/destinations/${slug}`);
    revalidatePath(`/en/destinations/${slug}`);
    revalidatePath(`/bn/destinations/${slug}`);
  }
}
