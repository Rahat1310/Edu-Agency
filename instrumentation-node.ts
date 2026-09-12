// Node-only. Turbopack can run `register()` before Next injects `.env.local`,
// so load it explicitly, then validate. Kept out of instrumentation.ts so the
// Edge bundle never sees this Node API (see instrumentation.ts).
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

await import("./lib/env");
