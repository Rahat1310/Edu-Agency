import { LeadDetailPanel } from "@/components/desk/lead-detail-panel";
import {
  listAssignableCounselors,
  type AssignableCounselor,
} from "@/lib/leads/counselors";
import { getLeadPanel } from "@/lib/leads/list";

type LeadPanelLoaderProps = {
  leadId: string;
  actorLabel: string;
};

export async function LeadPanelLoader({
  leadId,
  actorLabel,
}: LeadPanelLoaderProps) {
  try {
    const [panel, counselors] = await Promise.all([
      getLeadPanel(leadId),
      loadCounselors(),
    ]);

    if (!panel) {
      return (
        <LeadDetailPanel
          lead={null}
          activity={[]}
          actorLabel={actorLabel}
          missing
        />
      );
    }

    return (
      <LeadDetailPanel
        lead={panel.lead}
        activity={panel.activity}
        documents={panel.documents}
        messages={panel.messages}
        automationHistory={panel.automationHistory}
        visaApplication={panel.visaApplication}
        hasLinkedApplication={panel.hasLinkedApplication}
        visaLoadError={panel.visaLoadError}
        counselors={counselors}
        actorLabel={actorLabel}
      />
    );
  } catch {
    return (
      <LeadDetailPanel
        lead={null}
        activity={[]}
        actorLabel={actorLabel}
        loadError
      />
    );
  }
}

async function loadCounselors(): Promise<AssignableCounselor[]> {
  try {
    return await listAssignableCounselors();
  } catch {
    return [];
  }
}
