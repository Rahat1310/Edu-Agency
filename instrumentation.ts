export async function register() {
  // Edge has no filesystem; boot env validation belongs on Node only. The
  // runtime check lets Turbopack dead-code-eliminate the dynamic import (and
  // its Node APIs) out of the Edge bundle entirely.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
