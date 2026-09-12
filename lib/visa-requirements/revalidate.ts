import { revalidatePath, revalidateTag } from "next/cache";

import { VISA_REQUIREMENTS_CACHE_TAG } from "@/lib/visa-requirements/constants";

export function revalidateVisaRequirements() {
  revalidateTag(VISA_REQUIREMENTS_CACHE_TAG);
  revalidatePath("/admin/visa-requirements");
}
