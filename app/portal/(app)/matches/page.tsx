import { redirect } from "next/navigation";

import { PortalMatches } from "@/components/portal/portal-matches";
import { getStudentApplication } from "@/lib/auth-helpers";
import {
  matchProfileDraft,
  profileFromLeadContext,
} from "@/lib/matching/profile";
import { rankingForProfile } from "@/lib/matching/student-ranking";
import { firstName } from "@/lib/portal/copy";

export default async function PortalMatchesPage() {
  const application = await getStudentApplication();

  if (!application) {
    redirect("/portal/onboarding");
  }

  const context = {
    savedProfile: application.application.profile,
    quizAnswers: application.lead.quizAnswers,
    destinationInterest: application.lead.destinationInterest,
  };
  const profile = profileFromLeadContext(context);
  const draft = matchProfileDraft(context);
  const ranking = profile ? await rankingForProfile(profile) : null;

  return (
    <PortalMatches
      studentName={firstName(application.user.fullName, application.user.email)}
      draft={draft}
      hasCompleteProfile={Boolean(profile)}
      ranking={ranking}
    />
  );
}
