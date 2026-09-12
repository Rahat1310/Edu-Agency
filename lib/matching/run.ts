import "server-only";

import { chatCompletion } from "@/lib/ai/gateway";
import { getFaqCache } from "@/lib/ai/faq-cache";
import { rankProgramMatches } from "@/lib/matching/rank";
import type { StudentMatchProfile } from "@/lib/matching/profile";
import { loadMatchingShortlist } from "@/lib/matching/shortlist";

export async function runProgramMatches(
  profile: StudentMatchProfile,
  refresh = false,
) {
  return rankProgramMatches(
    { profile, refresh },
    {
      complete: chatCompletion,
      cache: getFaqCache(),
      loadShortlist: loadMatchingShortlist,
    },
  );
}
