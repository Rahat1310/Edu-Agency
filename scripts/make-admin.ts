import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Usage: npx tsx scripts/make-admin.ts <email>");
    process.exit(1);
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existing) {
    console.error(`User with email "${email}" not found in database.`);
    console.error("Sign in to the site once so your account exists in Clerk/DB, then run this script.");
    process.exit(1);
  }

  const [updated] = await db
    .update(users)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(users.id, existing.id))
    .returning();

  if (updated) {
    console.log(`Successfully promoted ${updated.email} to "admin"!`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Error promoting user:", err);
  process.exit(1);
});
