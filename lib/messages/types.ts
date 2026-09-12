import type {
  LeadDestinationInterest,
  LeadStatus,
  MessageChannel,
  MessageDirection,
  ThreadChannel,
} from "@/db/schema";

export type DeskThreadMessage = {
  id: string;
  channel: ThreadChannel;
  direction: MessageDirection;
  body: string;
  createdAt: string;
};

export type DeskAutomationKind = "nurture" | "reminder";

export type DeskAutomationEvent = {
  id: string;
  kind: DeskAutomationKind;
  label: string;
  sentAt: string;
};

export type DeskLeadMatch = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  status: LeadStatus;
  destinationInterest: LeadDestinationInterest;
};

export type UnmatchedMessageRow = {
  id: string;
  channel: ThreadChannel;
  direction: MessageDirection;
  body: string;
  createdAt: string;
  externalSenderId: string | null;
  suggestedLeads: DeskLeadMatch[];
};

export type { MessageChannel, MessageDirection, ThreadChannel };
