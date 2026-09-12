import { Suspense } from "react";
import Link from "next/link";

import { LeadDetailPanel } from "@/components/desk/lead-detail-panel";
import { LeadPanelLoader } from "@/components/desk/lead-panel-loader";
import { PipelineDesk } from "@/components/desk/pipeline-desk";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import { parseLeadListQuery } from "@/lib/leads/list-query";
import { listPipelineBoard } from "@/lib/leads/pipeline";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPipelinePage({ searchParams }: PageProps) {
  const user = await requireDashboardAccess();
  const query = parseLeadListQuery(await searchParams);
  const board = await listPipelineBoard();
  const actorLabel = user.fullName?.trim() || user.email;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
            Pipeline Board
          </h1>
          <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
            Drag a card or use the stage menu. Open a name for the detail
            panel.
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-2.5 text-xs font-semibold"
        >
          Open list
        </Link>
      </div>
      <div className="mt-4">
        <PipelineDesk board={board} selectedLeadId={query.lead || undefined} />
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
