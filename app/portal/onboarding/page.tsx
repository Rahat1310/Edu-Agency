import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { PhoneOnboarding } from "@/components/portal/phone-onboarding";
import { PortalPending } from "@/components/portal/portal-states";
import { getStudentApplication, requireRole } from "@/lib/auth-helpers";
import {
  phoneFromClerkUser,
  syncStudentApplicationLink,
} from "@/lib/leads/link-student";

export default async function PortalOnboardingPage() {
  const user = await requireRole("student");
  const linked = await getStudentApplication();

  if (linked) {
    redirect("/portal");
  }

  const clerkUser = await currentUser();
  const result = await syncStudentApplicationLink({
    user,
    phone: phoneFromClerkUser(clerkUser),
  });

  if (result.status === "linked") {
    redirect("/portal");
  }

  return result.status === "pending" ? <PortalPending /> : <PhoneOnboarding />;
}
