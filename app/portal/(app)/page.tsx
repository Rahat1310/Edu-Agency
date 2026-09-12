import { redirect } from "next/navigation";

import { PortalDashboard } from "@/components/portal/portal-dashboard";
import {
  getStudentApplication,
  type StudentApplication,
} from "@/lib/auth-helpers";
import { listStudentVisibleActivity } from "@/lib/leads/activity";
import { profileFromLeadContext } from "@/lib/matching/profile";
import { rankingForProfile } from "@/lib/matching/student-ranking";
import { firstName } from "@/lib/portal/copy";
import { visaApplicationStudentLine } from "@/lib/visa-applications/copy";
import { loadStudentVisaStatus } from "@/lib/visa-applications/load";
import { isVisaPipelineStage } from "@/lib/visa-applications/stage";
import { loadStudentVisaChecklist } from "@/lib/visa-requirements/student-checklist";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function PortalHomePage({ searchParams }: PageProps) {
  const application = await getStudentApplication();

  if (!application) {
    redirect("/portal/onboarding");
  }

  const params = await searchParams;
  const [activity, ranking, checklistResult, visaStatusResult] =
    await Promise.all([
      listStudentVisibleActivity(application.lead.id),
      loadDashboardMatches(application),
      loadStudentVisaChecklist(
        application.application.id,
        application.lead.destinationInterest,
      ),
      isVisaPipelineStage(application.lead.status)
        ? loadStudentVisaStatus(application.application.id)
        : Promise.resolve({ status: null, error: false }),
    ]);

  return (
    <PortalDashboard
      name={firstName(application.user.fullName, application.user.email)}
      destination={application.lead.destinationInterest}
      status={application.lead.status}
      activity={activity}
      forbidden={params.error === "forbidden"}
      ranking={ranking}
      checklist={checklistResult.checklist}
      checklistError={checklistResult.error}
      visaLine={
        visaStatusResult.status
          ? visaApplicationStudentLine(visaStatusResult.status)
          : null
      }
      visaStatusError={visaStatusResult.error}
    />
  );
}

async function loadDashboardMatches(application: StudentApplication) {
  const profile = profileFromLeadContext({
    savedProfile: application.application.profile,
    quizAnswers: application.lead.quizAnswers,
    destinationInterest: application.lead.destinationInterest,
  });

  if (!profile) {
    return null;
  }

  return rankingForProfile(profile);
}
