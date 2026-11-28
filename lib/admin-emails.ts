const OWNER_ADMIN_EMAIL = "studyabroadconsultancy01@gmail.com";

export function isConfiguredAdmin(
  email: string,
  additionalEmails = "",
): boolean {
  const configured = [OWNER_ADMIN_EMAIL, ...additionalEmails.split(",")]
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return configured.includes(email.trim().toLowerCase());
}
