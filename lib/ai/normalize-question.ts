/**
 * FAQ cache key input: lowercase, trim, strip punctuation/symbols,
 * collapse whitespace. Letters and digits (including Bengali) stay.
 */
export function normalizeQuestion(raw: string): string {
  return raw
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
