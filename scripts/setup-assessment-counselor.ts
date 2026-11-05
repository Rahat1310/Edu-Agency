import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, counselorProfiles } from "../db/schema";
import { normalizePhone } from "../lib/consultation/schema";
async function main() {
  const fullName = process.env.COUNSELLOR_FULL_NAME?.trim();
  const phone = normalizePhone(process.env.COUNSELLOR_PHONE ?? "");
  const whatsapp = normalizePhone(process.env.COUNSELLOR_WHATSAPP ?? "");
  const email = process.env.COUNSELLOR_WORK_EMAIL?.trim();
  if (
    !fullName ||
    fullName.includes("TO BE CONFIGURED") ||
    !/^[+][1-9]\d{6,14}$/.test(phone) ||
    !/^[+][1-9]\d{6,14}$/.test(whatsapp) ||
    !email
  )
    throw new Error(
      "Set real counsellor name, valid phones and COUNSELLOR_WORK_EMAIL for an existing staff account.",
    );
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user?.isActive || !["admin", "counselor"].includes(user.role))
    throw new Error(
      "Create the Clerk staff account and grant counselor/admin role first.",
    );
  await db
    .insert(counselorProfiles)
    .values({
      id: user.id,
      fullName,
      title: process.env.COUNSELLOR_TITLE || "Student Admissions Counsellor",
      phone,
      whatsapp,
      email,
      active: true,
      autoAssign: true,
    })
    .onConflictDoUpdate({
      target: counselorProfiles.id,
      set: {
        fullName,
        phone,
        whatsapp,
        email,
        title: process.env.COUNSELLOR_TITLE || "Student Admissions Counsellor",
        active: true,
        autoAssign: true,
        updatedAt: new Date(),
      },
    });
  console.info(
    "Counsellor profile configured. Existing lead assignments were preserved.",
  );
}
main().catch(() => {
  console.error(
    "Counsellor setup failed. Check configuration and the single auto-assignment constraint.",
  );
  process.exitCode = 1;
});
