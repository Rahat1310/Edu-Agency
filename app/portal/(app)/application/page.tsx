import { ApplicationTracker } from "@/components/portal/application-tracker";
import { applicationReference } from "@/lib/applications/schema";
import { redirect } from "next/navigation";
import { getStudentApplication } from "@/lib/auth-helpers";
import { loadApplicationCase } from "@/lib/applications/load";
import { listDocumentsForApplication } from "@/lib/documents/list";
import { StudentApplicationForm } from "@/components/portal/application-form";

export default async function ApplicationPage() {
  const linked = await getStudentApplication();
  if (!linked) redirect("/portal/onboarding");
  const [application, documents] = await Promise.all([
    loadApplicationCase(linked.application.id),
    listDocumentsForApplication(linked.application.id),
  ]);
  if (!application) redirect("/portal/onboarding");
  if (!application.hasSavedData) {
    application.data.fullName = linked.user.fullName ?? linked.lead.name;
    application.data.phone = linked.lead.phone;
    application.data.country = linked.lead.destinationInterest;
  }
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {application.submittedAt && (
        <ApplicationTracker
          live={application.formStatus === "submitted"}
          tracking={application.tracking}
          submittedAt={application.submittedAt}
          reference={applicationReference(application.id)}
        />
      )}
      <StudentApplicationForm application={application} documents={documents} />
    </div>
  );
}
