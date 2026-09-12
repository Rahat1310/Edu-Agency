import "server-only";

import { sendTransactionalEmail } from "@/lib/email/send";
import { calendarDateInTimeZone } from "@/lib/intakes/countdown";
import { ensureNurtureActorUserId } from "@/lib/nurture/actor";
import { sendNurtureAndRecord } from "@/lib/nurture/dispatch";
import {
  loadLiveNurtureState,
  loadNurtureCandidates,
  recordNurtureSend,
} from "@/lib/nurture/load";
import { matchDueNurture, type DueNurture } from "@/lib/nurture/match";
import { minNurtureAfterDays, nurtureSequence } from "@/lib/nurture/sequence";
import { shiftYmd } from "@/lib/reminders/ymd";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send";

function cutoffFromIdleDays(now: Date, idleDays: number): Date {
  const todayYmd = calendarDateInTimeZone(now);
  const cutoffYmd = shiftYmd(todayYmd, -idleDays);
  return new Date(`${cutoffYmd}T00:00:00+06:00`);
}

export async function findDueNurture(now = new Date()): Promise<DueNurture[]> {
  const idleDays = minNurtureAfterDays(nurtureSequence);
  const candidates = await loadNurtureCandidates(
    cutoffFromIdleDays(now, idleDays),
  );
  return matchDueNurture(candidates, nurtureSequence, now);
}

export async function sendDueNurture(
  due: readonly DueNurture[],
  now = new Date(),
) {
  const actorUserId = await ensureNurtureActorUserId();

  return sendNurtureAndRecord(
    due,
    {
      loadLiveState: loadLiveNurtureState,
      recordSent: recordNurtureSend,
      sendWhatsApp: sendWhatsAppMessage,
      sendEmail: sendTransactionalEmail,
      actorUserId,
    },
    now,
  );
}

export async function runLeadNurture(now = new Date()) {
  const due = await findDueNurture(now);
  return sendDueNurture(due, now);
}
