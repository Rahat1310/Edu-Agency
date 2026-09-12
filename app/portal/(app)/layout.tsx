import { redirect } from "next/navigation";

import { PortalShell } from "@/components/portal/portal-shell";
import { getStudentApplication } from "@/lib/auth-helpers";
import { firstName } from "@/lib/portal/copy";

export default async function PortalAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const application = await getStudentApplication();

  if (!application) {
    redirect("/portal/onboarding");
  }

  const studentName = firstName(
    application.user.fullName,
    application.user.email,
  );

  return <PortalShell studentName={studentName}>{children}</PortalShell>;
}
