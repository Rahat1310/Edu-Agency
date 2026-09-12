import type { SendEmailResult } from "@/lib/email/send";
import { renderNurtureTemplate } from "@/lib/nurture/copy";
import {
  isNurtureEligibleStatus,
  isWhatsAppSessionOpen,
  type DueNurture,
} from "@/lib/nurture/match";
import {
  NURTURE_ACTIVITY_PREFIX,
  WHATSAPP_SESSION_HOURS,
} from "@/lib/nurture/sequence";
import type { SendWhatsAppResult } from "@/lib/whatsapp/send";

export type NurtureDispatchDeps = {
  loadLiveState: (leadIds: readonly string[]) => Promise<{
    statusByLead: Map<string, string>;
    inboundLeadIds: Set<string>;
    sentKeys: Set<string>;
  }>;
  recordSent: (input: {
    leadId: string;
    stepId: string;
    channel: "whatsapp" | "email";
    actorUserId: string;
    activityContent: string;
    messageBody: string;
  }) => Promise<void>;
  sendWhatsApp: (input: {
    to: string;
    text?: string;
    template?: {
      name: string;
      language: string;
      bodyParameters: readonly string[];
    };
  }) => Promise<SendWhatsAppResult>;
  sendEmail: (input: {
    to: string;
    subject: string;
    text: string;
    idempotencyKey?: string;
  }) => Promise<SendEmailResult>;
  actorUserId: string;
};

export type NurtureDispatchResult = {
  due: number;
  sent: number;
  skipped: number;
  whatsapp: number;
  emails: number;
};

function whatsappTo(item: DueNurture): string | null {
  const raw = item.whatsapp?.trim() || item.phone.trim();
  return raw.length > 0 ? raw : null;
}

/**
 * Re-check status and inbound replies before each send so a stage move
 * or a student reply never gets a leftover drip.
 */
export async function sendNurtureAndRecord(
  due: readonly DueNurture[],
  deps: NurtureDispatchDeps,
  now = new Date(),
): Promise<NurtureDispatchResult> {
  const live = await deps.loadLiveState(due.map((item) => item.leadId));

  let sent = 0;
  let skipped = 0;
  let whatsapp = 0;
  let emails = 0;

  for (const item of due) {
    const key = `${item.leadId}:${item.step.id}`;
    const status = live.statusByLead.get(item.leadId);

    if (
      !status ||
      !isNurtureEligibleStatus(status) ||
      live.inboundLeadIds.has(item.leadId) ||
      live.sentKeys.has(key)
    ) {
      skipped += 1;
      continue;
    }

    const copyInput = {
      name: item.name,
      destinationInterest: item.destinationInterest,
    };
    const emailSubject = renderNurtureTemplate(
      item.step.emailSubject,
      copyInput,
    );
    const emailBody = renderNurtureTemplate(item.step.emailBody, copyInput);
    const whatsappBody = renderNurtureTemplate(
      item.step.whatsappBody,
      copyInput,
    );
    const destination = renderNurtureTemplate("{destination}", copyInput);
    const toWhatsApp = whatsappTo(item);

    let channel: "whatsapp" | "email";
    let messageBody: string;

    if (toWhatsApp) {
      const sessionOpen = isWhatsAppSessionOpen(
        item.lastInboundAt,
        now,
        WHATSAPP_SESSION_HOURS,
      );

      try {
        if (sessionOpen) {
          await deps.sendWhatsApp({ to: toWhatsApp, text: whatsappBody });
        } else {
          await deps.sendWhatsApp({
            to: toWhatsApp,
            template: {
              name: item.step.whatsappTemplate.name,
              language: item.step.whatsappTemplate.language,
              bodyParameters: [item.name.trim() || "there", destination],
            },
          });
        }
        channel = "whatsapp";
        messageBody = whatsappBody;
        whatsapp += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown WhatsApp error";
        if (!item.email) {
          throw new Error(message);
        }
        console.error("[nurture] WhatsApp failed; falling back to email", {
          leadId: item.leadId,
          stepId: item.step.id,
          message,
        });
        await deps.sendEmail({
          to: item.email,
          subject: emailSubject,
          text: emailBody,
          idempotencyKey: `nurture:${key}`,
        });
        channel = "email";
        messageBody = emailBody;
        emails += 1;
      }
    } else if (item.email) {
      await deps.sendEmail({
        to: item.email,
        subject: emailSubject,
        text: emailBody,
        idempotencyKey: `nurture:${key}`,
      });
      channel = "email";
      messageBody = emailBody;
      emails += 1;
    } else {
      skipped += 1;
      continue;
    }

    await deps.recordSent({
      leadId: item.leadId,
      stepId: item.step.id,
      channel,
      actorUserId: deps.actorUserId,
      activityContent: `${NURTURE_ACTIVITY_PREFIX}(${item.step.id}) sent via ${channel}.`,
      messageBody,
    });

    live.sentKeys.add(key);
    sent += 1;
  }

  return {
    due: due.length,
    sent,
    skipped,
    whatsapp,
    emails,
  };
}
