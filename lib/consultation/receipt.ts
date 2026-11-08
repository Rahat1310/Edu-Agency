import type { Confirmation, CounsellorContact } from "./schema";
import { escapeHtml } from "./email-html";

export function buildAssessmentReceipt(
  confirmation: Confirmation,
  contact: CounsellorContact,
) {
  const whatsapp = `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`;
  const text = [
    "Study Abroad Consultant",
    "Student assessment confirmation",
    "",
    `Hello ${confirmation.firstName},`,
    "Your student profile assessment has been received.",
    `Reference: ${confirmation.reference}`,
    "",
    confirmation.counselor
      ? "Your assigned counsellor"
      : "Office contact (counsellor assignment pending)",
    contact.fullName,
    contact.title,
    `Phone: ${contact.phone}`,
    `WhatsApp: ${whatsapp}`,
    "",
    "Your counsellor will review your information and contact you. For urgent enquiries, call or message on WhatsApp and include your reference number.",
    "Keep this confirmation so you can find these details later.",
  ].join("\n");
  return {
    subject: `Your assessment & counsellor details | ${confirmation.reference}`,
    text,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#102b4e"><h1>Assessment received</h1><pre style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.8">${escapeHtml(text)}</pre></div>`,
  };
}
