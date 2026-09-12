import { UnmatchedMessagesQueue } from "@/components/desk/unmatched-messages-queue";
import { requireDashboardAccess } from "@/lib/auth-helpers";
import {
  listUnmatchedMessages,
  searchLeadsForMessageLink,
} from "@/lib/messages/load";
import { unmatchedMessagesQuerySchema } from "@/lib/schemas/messages";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminUnmatchedMessagesPage({
  searchParams,
}: PageProps) {
  await requireDashboardAccess();
  const query = unmatchedMessagesQuerySchema.parse({
    q: first((await searchParams).q),
  });
  const [rows, searchedLeads] = await Promise.all([
    listUnmatchedMessages(),
    searchLeadsForMessageLink(query.q),
  ]);

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-[-0.02em] text-[var(--desk-ink)]">
        Unmatched messages
      </h1>
      <p className="mt-1 text-[0.75rem] text-[var(--desk-ink-muted)]">
        WhatsApp and Messenger inbound that did not attach to a lead. Link a row
        to move it onto that file&apos;s thread.
      </p>
      <div className="mt-4">
        <UnmatchedMessagesQueue
          rows={rows}
          searchQuery={query.q}
          searchedLeads={searchedLeads}
        />
      </div>
    </div>
  );
}
