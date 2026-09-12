import type { MessageChannel, ThreadChannel } from "@/db/schema";
import { formatLeadDate } from "@/lib/leads/labels";
import type { DeskThreadMessage } from "@/lib/messages/types";

export const threadChannelLabels: Record<ThreadChannel, string> = {
  whatsapp: "WhatsApp",
  messenger: "Messenger",
};

export const messageChannelLabels: Record<MessageChannel, string> = {
  ...threadChannelLabels,
  email: "Email",
};

export function threadDirectionLabel(
  direction: DeskThreadMessage["direction"],
): string {
  return direction === "inbound"
    ? "received from the student"
    : "sent by the agency";
}

export function threadMessageAriaLabel(message: DeskThreadMessage): string {
  const channel = threadChannelLabels[message.channel];
  const direction = threadDirectionLabel(message.direction);
  const body = message.body.trim() || "no text";
  const when = formatLeadDate(message.createdAt);

  return `${channel}, ${direction}. ${body}. ${when}`;
}

export function nurtureHistoryLabel(
  stepId: string,
  channel: MessageChannel,
): string {
  return `Nurture ${stepId} via ${messageChannelLabels[channel]}`;
}

export function reminderHistoryLabel(window: number): string {
  return `Intake reminder (${window} days out)`;
}
