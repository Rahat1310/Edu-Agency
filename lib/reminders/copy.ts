import type { ProgramCountry } from "@/db/schema";
import { AGENCY_TIME_ZONE } from "@/lib/intakes/countdown";
import { programCountryLabels } from "@/lib/programs-labels";
import { absoluteUrl } from "@/lib/site-url";

export type IntakeReminderCopyInput = {
  studentName: string;
  destination: ProgramCountry;
  intakeLabel: string;
  applicationDeadline: string;
  daysRemaining: number;
};

function formatDeadlineDate(ymd: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: AGENCY_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${ymd}T00:00:00+06:00`));
}

function remainingPhrase(daysRemaining: number): string {
  if (daysRemaining <= 0) {
    return "today";
  }
  if (daysRemaining === 1) {
    return "tomorrow";
  }
  return `in ${daysRemaining} days`;
}

export function intakeReminderEmail(input: IntakeReminderCopyInput): {
  subject: string;
  text: string;
} {
  const destination = programCountryLabels[input.destination];
  const when = remainingPhrase(input.daysRemaining);
  const date = formatDeadlineDate(input.applicationDeadline);
  const portalUrl = absoluteUrl("/portal");

  return {
    subject: `${destination} ${input.intakeLabel} application deadline ${when}`,
    text: [
      `Hi ${input.studentName},`,
      "",
      `The ${input.intakeLabel} application deadline for ${destination} is ${date} (${when}).`,
      "",
      "Open your portal for documents and next steps:",
      portalUrl,
      "",
      "This is a deadline reminder from Study Abroad Consultancy. It is not an admission decision.",
    ].join("\n"),
  };
}

export function intakeReminderSms(input: IntakeReminderCopyInput): string {
  const destination = programCountryLabels[input.destination];
  const when = remainingPhrase(input.daysRemaining);
  const date = formatDeadlineDate(input.applicationDeadline);
  const portalUrl = absoluteUrl("/portal");

  return `Study Abroad Consultancy: ${destination} ${input.intakeLabel} deadline is ${date} (${when}). Portal: ${portalUrl}`;
}
