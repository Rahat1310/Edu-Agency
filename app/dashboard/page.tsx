import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { dashboardRoles } from "@/lib/authz";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "unknown";

  const [record] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  const params = await searchParams;
  const forbidden = params.error === "forbidden";

  if (record?.role === "student") {
    redirect(forbidden ? "/portal?error=forbidden" : "/portal");
  }

  return (
    <div className="px-5 py-10">
      {forbidden ? (
        <p
          role="alert"
          className="mb-6 max-w-xl rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/8 px-4 py-3 text-sm text-[var(--destructive)]"
        >
          You do not have access to the internal desk.
        </p>
      ) : null}
      <p className="text-[var(--brand-ink)]">Signed in as {email}</p>
      {record && dashboardRoles.some((role) => role === record.role) ? (
        <p className="mt-4">
          <Link
            href="/admin/programs"
            className="focus-ring rounded-md text-sm font-bold text-[var(--brand-blue)]"
          >
            Manage programs
          </Link>
        </p>
      ) : null}
    </div>
  );
}
