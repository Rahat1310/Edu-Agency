/**
 * Success-story photos are founder-approved public marketing assets.
 *
 * They do **not** use the Phase 4.4 private-bucket signed-URL viewer
 * (`applications/{id}/...` keys, short-lived GET grants, `/api/.../view`).
 * Mixing them would put public testimonials on a security model built for
 * student PII, and ISR HTML would hold URLs that expire.
 *
 * Store an object key in `success_stories.photo_r2_key` (for example
 * `success-stories/ayesha.jpg`) on a **public** R2 bucket or r2.dev /
 * custom domain. `R2_PUBLIC_BASE_URL` turns that key into a stable img src.
 * Leave the env var empty to ship stories without photos (initials avatar).
 *
 * Never point this helper at `applications/` keys.
 */

export const SUCCESS_STORY_PHOTO_PREFIX = "success-stories/";

export function isSafeMarketingPhotoKey(key: string): boolean {
  if (key.length === 0 || key.length > 500) {
    return false;
  }

  if (
    key.includes("..") ||
    key.includes("\\") ||
    key.startsWith("/") ||
    key.includes("://")
  ) {
    return false;
  }

  if (key.startsWith("applications/")) {
    return false;
  }

  return /^[A-Za-z0-9._\-/]+$/.test(key);
}

export function normalizeMarketingPhotoKey(
  value: string,
): string | null | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    try {
      const url = new URL(trimmed);
      const path = url.pathname.replace(/^\//, "");
      return isSafeMarketingPhotoKey(path) ? path : undefined;
    } catch {
      return undefined;
    }
  }

  return isSafeMarketingPhotoKey(trimmed) ? trimmed : undefined;
}

export function marketingAssetUrl(
  key: string | null | undefined,
  publicBaseUrl = process.env.R2_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL,
): string | null {
  if (!key || !isSafeMarketingPhotoKey(key)) {
    return null;
  }

  const base = publicBaseUrl?.trim();
  if (!base) {
    return null;
  }

  return `${base.replace(/\/$/, "")}/${key}`;
}
