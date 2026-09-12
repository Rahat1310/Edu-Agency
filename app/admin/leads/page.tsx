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
  const query = parseLeadListQuery(await searchParams);
  const list = await listLeads(query);
  const actorLabel = user.fullName?.trim() || user.email;

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
        Leads
      </h1>
      <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
        Newest first. Open a row for the detail panel. Filters stay in the
        URL.
      </p>
      <div className="mt-4">
        <LeadsDesk
          query={query}
          list={list}
          selectedKey={query.lead}
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
