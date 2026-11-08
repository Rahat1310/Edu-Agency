export function isEmailConfigured() {
  return Boolean(
    (process.env.BREVO_API_KEY?.trim() || process.env.RESEND_API_KEY?.trim()) &&
    process.env.EMAIL_FROM?.trim(),
  );
}
