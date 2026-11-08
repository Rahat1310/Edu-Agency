import { escapeHtml } from "./email-html";
import {
  buildAssessmentSections,
  formatAssessmentDate,
  type AssessmentDetails,
} from "./presentation";

export function buildStaffAssessmentEmail(
  input: AssessmentDetails & {
    reference: string;
    submittedAt?: Date | string | null;
    privateUrl: string;
  },
) {
  const sections = buildAssessmentSections(input);
  const { assessment: a, reference, privateUrl } = input;
  const submitted = formatAssessmentDate(input.submittedAt);
  const summary = `${a.name} · ${a.degree} in ${a.subject} · ${a.country}`;
  const text = [
    [
      "New student assessment",
      `Reference: ${reference}`,
      summary,
      `Submitted: ${submitted}`,
    ].join("\n"),
    ...sections.map(
      ({ title, rows }) =>
        `${title}\n${rows.map(({ label, value }) => (Array.isArray(value) ? `${label}:\n${value.map((item) => `  • ${item}`).join("\n")}` : `${label}: ${value}`)).join("\n")}`,
    ),
    `View private assessment: ${privateUrl}`,
  ].join("\n\n");
  const html = `<div style="margin:0 auto;max-width:720px;font-family:Arial,sans-serif;color:#102b4e;line-height:1.6">
    <div style="padding:24px;background:#eff6ff;border-radius:12px">
      <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase">Study Abroad Consultant</p>
      <h1 style="margin:8px 0;font-size:26px">New student assessment</h1>
      <p style="margin:4px 0;font-weight:bold">${escapeHtml(summary)}</p>
      <p style="margin:4px 0">Reference: ${escapeHtml(reference)}<br>Submitted: ${escapeHtml(submitted)}</p>
    </div>
    ${sections
      .map(
        ({
          title,
          rows,
        }) => `<h2 style="margin:28px 0 10px;font-size:18px">${escapeHtml(title)}</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">${rows
        .map(
          ({ label, value }) => `<tr>
        <td style="width:40%;padding:10px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;color:#475569">${escapeHtml(label)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;vertical-align:top;overflow-wrap:anywhere">${Array.isArray(value) ? `<ul style="margin:0;padding-left:18px">${value.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : escapeHtml(value).replace(/\n/g, "<br>")}</td>
      </tr>`,
        )
        .join("")}</table>`,
      )
      .join("")}
    <p style="margin:28px 0"><a href="${escapeHtml(privateUrl)}" style="display:inline-block;background:#102b4e;color:white;padding:12px 20px;border-radius:8px;text-decoration:none">View private assessment</a></p>
    <p style="font-size:12px;color:#64748b">Staff sign-in is required to view this assessment.</p>
  </div>`;
  return {
    subject: `New Student Assessment | ${reference} | ${a.country}`,
    text,
    html,
  };
}
