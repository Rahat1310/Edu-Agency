/**
 * Best-effort client IP for rate limiting. Prefer Cloudflare's header
 * when the request arrived through their edge.
 */
export function getRequestIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) {
    return cf;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const real = request.headers.get("x-real-ip")?.trim();
  if (real) {
    return real;
  }

  return "unknown";
}
