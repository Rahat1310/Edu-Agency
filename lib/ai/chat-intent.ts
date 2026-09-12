import { normalizeQuestion } from "@/lib/ai/normalize-question";

const negotiationPatterns: readonly RegExp[] = [
  /\bhow much do you (charge|cost|take)\b/,
  /\b(your|consultancy|agency|counsel(?:l)?ing) (fee|fees|charge|charges|price|prices)\b/,
  /\b(fee|fees) discount\b/,
  /\bdiscount (on|for) (your|the) (fee|fees|price)\b/,
  /\bnegotiat/,
  /\bwaive (your|the)?\s*(fee|fees|charge)/,
  /\breduce (your|the) (fee|fees|price|charge)/,
  /\bcommission\b/,
  /আপনাদের (ফি|দাম|চার্জ)/,
  /কাউন্সেলিং ফি/,
  /কনসালটেন্সি ফি/,
  /ছাড়/,
  /কমিশন/,
];

const personalCasePatterns: readonly RegExp[] = [
  /\bmy (gpa|cgpa|ielts|toefl|hsk|topik|visa|case|situation|file|rejection|offer|passport|documents?)\b/,
  /\bi was (rejected|refused)\b/,
  /\bthey (rejected|refused) my\b/,
  /\bcan i (still )?apply with my\b/,
  /আমার (জিপিএ|সিজিপিএ|আইইএলটিএস|টোফেল|এইচএসকে|টোপিক|ভিসা|কেস|ফাইল|পরিস্থিতি|ডকুমেন্ট)/,
  /রিজেক্ট/,
];

/**
 * Pricing of *our* service, or a personal file, needs a counselor —
 * skip the model and offer the lead form instead of answering.
 */
export function needsHumanHandoff(raw: string): boolean {
  const text = normalizeQuestion(raw);

  if (!text) {
    return false;
  }

  return (
    negotiationPatterns.some((pattern) => pattern.test(text)) ||
    personalCasePatterns.some((pattern) => pattern.test(text))
  );
}
