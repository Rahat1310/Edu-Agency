/**
 * Founder-editable nurture sequence (Section 5.6). Same spirit as
 * `eligibilityRules`: change the list, not the matcher.
 *
 * `afterDays` is days since last human contact (lead created, desk
 * activity, or inbound message). The job picks the latest bucket the
 * lead has reached that has not already been sent.
 *
 * WhatsApp templates must be approved in Meta Business Manager and
 * use two body variables: {{1}} student name, {{2}} destination.
 */

export const NURTURE_ELIGIBLE_STATUSES = ["new", "contacted"] as const;

export const NURTURE_ACTIVITY_PREFIX = "Nurture ";

export const WHATSAPP_SESSION_HOURS = 24;

export type NurtureStep = {
  id: string;
  afterDays: number;
  emailSubject: string;
  emailBody: string;
  /** Free-form body inside the WhatsApp 24-hour customer-care window. */
  whatsappBody: string;
  /** Utility template used outside the 24-hour window. */
  whatsappTemplate: {
    name: string;
    language: string;
  };
};

/**
 * Default drip for `new` / `contacted` leads. Idle floor is the smallest
 * `afterDays`. Tune here without changing `matchNurtureStep`.
 */
export const nurtureSequence: readonly NurtureStep[] = [
  {
    id: "idle-5",
    afterDays: 5,
    emailSubject: "Checking in from Study Abroad Consultancy",
    emailBody:
      "Hi {name},\n\nWe noticed a few days have passed since we last heard from you about studying in {destination}. A counselor is happy to pick up whenever you are ready — reply to this email or open your portal:\n{portalUrl}\n\nThis is a follow-up from Study Abroad Consultancy. It is not an admission decision.",
    whatsappBody:
      "Hi {name}, Study Abroad Consultancy here. Just checking in about {destination} — a counselor can continue whenever you are ready. Portal: {portalUrl}",
    whatsappTemplate: {
      name: "nurture_idle_5",
      language: "en",
    },
  },
  {
    id: "idle-10",
    afterDays: 10,
    emailSubject: "Still here if you want help with {destination}",
    emailBody:
      "Hi {name},\n\nIt has been a little while since we last spoke about {destination}. If you still want help with documents, intakes, or next steps, reply to this email or use the portal:\n{portalUrl}\n\nThis is a follow-up from Study Abroad Consultancy. It is not an admission decision.",
    whatsappBody:
      "Hi {name}, still happy to help with {destination} when you are ready. Portal: {portalUrl}",
    whatsappTemplate: {
      name: "nurture_idle_10",
      language: "en",
    },
  },
  {
    id: "idle-20",
    afterDays: 20,
    emailSubject: "Last follow-up from Study Abroad Consultancy",
    emailBody:
      "Hi {name},\n\nThis is a last check-in about {destination}. We will not keep chasing you. If you want to continue, reply to this email or open the portal:\n{portalUrl}\n\nThis is a follow-up from Study Abroad Consultancy. It is not an admission decision.",
    whatsappBody:
      "Hi {name}, last check-in from Study Abroad Consultancy about {destination}. Reply when you want to continue. Portal: {portalUrl}",
    whatsappTemplate: {
      name: "nurture_idle_20",
      language: "en",
    },
  },
];

export function minNurtureAfterDays(
  sequence: readonly NurtureStep[] = nurtureSequence,
): number {
  if (sequence.length === 0) {
    return 5;
  }

  return Math.min(...sequence.map((step) => step.afterDays));
}
