import "server-only";

import { AiGatewayError } from "@/lib/ai/types";
import type { StudentMatchProfile } from "@/lib/matching/profile";
import { runProgramMatches } from "@/lib/matching/run";
import type { PortalMatchRanking } from "@/lib/matching/types";

const RANKING_UNAVAILABLE =
  "We couldn't rank programs just now. Try again in a few minutes, or WhatsApp us.";

export async function rankingForProfile(
  profile: StudentMatchProfile,
): Promise<PortalMatchRanking> {
  try {
    const result = await runProgramMatches(profile);
    return {
      matches: result.matches,
      shortlistCount: result.shortlistCount,
      cached: result.cached,
      emptyShortlist: result.emptyShortlist,
    };
  } catch (error) {
    if (error instanceof AiGatewayError) {
      return {
        matches: [],
        shortlistCount: 0,
        cached: false,
        emptyShortlist: false,
        error: RANKING_UNAVAILABLE,
      };
    }

    throw error;
  }
}
