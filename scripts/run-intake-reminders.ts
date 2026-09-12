import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { runIntakeDeadlineReminders } = await import("@/lib/reminders/run");
  const result = await runIntakeDeadlineReminders();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
