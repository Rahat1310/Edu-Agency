import { AssessmentDashboard } from "@/components/consultation/admin-dashboard";
import Link from "next/link";

import { Suspense } from "react";

import { LeadDetailPanel } from "@/components/desk/lead-detail-panel";
import { LeadPanelLoader } from "@/components/desk/lead-panel-loader";
import { LeadsDesk } from "@/components/desk/leads-desk";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import { listLeads } from "@/lib/leads/list";
import { parseLeadListQuery } from "@/lib/leads/list-query";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const user = await requireDashboardAccess();
  const params = await searchParams;
  if (params.view === "assessments" && !params.lead)
    return (
      <AssessmentDashboard params={params} canDelete={user.role === "admin"} />
    );
  const query = parseLeadListQuery(params);
  const list = await listLeads(query);
  const actorLabel = user.fullName?.trim() || user.email;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
          All leads
        </h1>
        <Link
          href="/admin/leads?view=assessments"
          className="desk-focus text-sm underline"
        >
          Assessment follow-ups
        </Link>
      </div>
      <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
        Every enquiry, assessment and student account in one place. The pipeline
        tracks these same leads.
      </p>
      <div className="mt-4">
        <LeadsDesk
          query={query}
          list={list}
          selectedKey={query.lead}
          canDelete={user.role === "admin"}
        />
      </div>
      {query.lead ? (
        <Suspense
          fallback={
            <LeadDetailPanel
              lead={null}
              activity={[]}
              actorLabel={actorLabel}
              loading
            />
          }
        >
          <LeadPanelLoader leadId={query.lead} actorLabel={actorLabel} />
        </Suspense>
      ) : null}
    </div>
  );
}
