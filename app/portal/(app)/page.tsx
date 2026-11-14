import { redirect } from "next/navigation";

import { PortalDashboard } from "@/components/portal/portal-dashboard";
import { loadApplicationCase } from "@/lib/applications/load";
import { getStudentApplication } from "@/lib/auth-helpers";
import { listStudentVisibleActivity } from "@/lib/leads/activity";
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
  const [activity, checklistResult, visaStatusResult, applicationCase] =
    await Promise.all([
      listStudentVisibleActivity(application.lead.id),
      isVisaPipelineStage(application.lead.status)
        ? loadStudentVisaChecklist(
            application.application.id,
            application.lead.destinationInterest,
          )
        : Promise.resolve({
            checklist: { items: [], submittedCount: 0, total: 0 },
            error: false,
          }),
      isVisaPipelineStage(application.lead.status)
        ? loadStudentVisaStatus(application.application.id)
        : Promise.resolve({ status: null, error: false }),
      loadApplicationCase(application.application.id),
    ]);

  return (
    <PortalDashboard
      name={firstName(application.user.fullName, application.user.email)}
      destination={application.lead.destinationInterest}
      status={application.lead.status}
      applicationCase={applicationCase}
      activity={activity}
      forbidden={params.error === "forbidden"}
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
