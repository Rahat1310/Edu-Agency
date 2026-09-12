import { phonesMatch } from "@/lib/phone";
import type { DeskLeadMatch, UnmatchedMessageRow } from "@/lib/messages/types";

export function suggestedLeadsForMessage(
  message: Pick<UnmatchedMessageRow, "channel" | "externalSenderId">,
  candidates: readonly DeskLeadMatch[],
): DeskLeadMatch[] {
  if (message.channel !== "whatsapp" || !message.externalSenderId) {
    return [];
  }

  const sender = message.externalSenderId;

  return candidates.filter((lead) => {
    if (phonesMatch(sender, lead.phone)) {
      return true;
    }

    return lead.whatsapp ? phonesMatch(sender, lead.whatsapp) : false;
  });
}

export function mergeLeadOptions(
  suggested: readonly DeskLeadMatch[],
  searched: readonly DeskLeadMatch[],
): DeskLeadMatch[] {
  const seen = new Set<string>();
  const merged: DeskLeadMatch[] = [];

  for (const lead of [...suggested, ...searched]) {
    if (seen.has(lead.id)) {
      continue;
    }

    seen.add(lead.id);
    merged.push(lead);
  }

  return merged;
}
