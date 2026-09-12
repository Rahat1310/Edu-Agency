import { revalidatePath, revalidateTag } from "next/cache";

import { PROGRAMS_CACHE_TAG } from "@/lib/programs-public";

/**
 * Bust the public directory immediately after an admin publish/edit/delete.
 * `revalidateTag` drops the cached Neon reads; `revalidatePath` refreshes
 * the ISR HTML for both locale URLs.
 */
export function revalidatePublicPrograms(programId?: string) {
  revalidateTag(PROGRAMS_CACHE_TAG);
  revalidatePath("/programs");
  revalidatePath("/en/programs");
  revalidatePath("/bn/programs");
  revalidatePath("/cost-calculator");
  revalidatePath("/en/cost-calculator");
  revalidatePath("/bn/cost-calculator");
  revalidatePath("/programs/compare");
  revalidatePath("/en/programs/compare");
  revalidatePath("/bn/programs/compare");

  if (programId) {
    revalidatePath(`/programs/${programId}`);
    revalidatePath(`/en/programs/${programId}`);
    revalidatePath(`/bn/programs/${programId}`);
  }
}
