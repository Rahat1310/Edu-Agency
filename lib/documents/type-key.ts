export const DOCUMENT_TYPE_KEY_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;

export const DOCUMENT_TYPE_KEY_MESSAGE =
  "Use a lowercase slug with letters, numbers, and underscores (e.g. jw201_jw202).";

export function isDocumentTypeKey(value: string): boolean {
  return DOCUMENT_TYPE_KEY_PATTERN.test(value);
}
