import { UnlinkedQueue } from "@/components/desk/unlinked-queue";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import { listUnlinkedAccounts } from "@/lib/leads/unlinked";

export default async function AdminUnlinkedPage() {
  await requireDashboardAccess();
  const rows = await listUnlinkedAccounts();

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
        Unlinked accounts
      </h1>
      <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
        Students whose phone number matched more than one inquiry. Pick the
        right file — do not guess from the portal.
      </p>
      <div className="mt-4">
        <UnlinkedQueue rows={rows} />
      </div>
    </div>
  );
}
