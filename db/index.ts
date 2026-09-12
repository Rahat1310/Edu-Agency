import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "@/lib/env";

import * as schema from "./schema";

// HTTP driver, not the WebSocket/Pool client — correct for Vercel serverless (Section 7).
const sql = neon(env.DATABASE_URL);

export const db = drizzle({ client: sql, schema });
