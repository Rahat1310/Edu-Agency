import { Resend } from "resend";
import { escapeHtml } from "@/lib/consultation/email-html";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  idempotencyKey?: string;
};

export type SendEmailResult = {
  id: string | null;
  dryRun: boolean;
};

export class EmailAcceptanceUncertainError extends Error {}

// Brevo takes precedence when configured. Never fall back after a send attempt.
export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const brevoKey = process.env.BREVO_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey && !brevoKey) {
    return { id: null, dryRun: true };
  }

  if (!from) {
    throw new Error(
      "EMAIL_FROM is missing. Add it to .env.local (see .env.example).",
    );
  }

  if (brevoKey) {
    const namedSender = from.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
    const sender =
      namedSender?.[1] !== undefined && namedSender[2] !== undefined
        ? {
            name: namedSender[1].replace(/^"|"$/g, ""),
            email: namedSender[2].trim(),
          }
        : { email: from };
    let response: Response;
    try {
      response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender,
          to: [{ email: input.to }],
          subject: input.subject,
          textContent: input.text,
          htmlContent: input.html ?? `<pre>${escapeHtml(input.text)}</pre>`,
          ...(process.env.EMAIL_REPLY_TO?.trim()
            ? { replyTo: { email: process.env.EMAIL_REPLY_TO.trim() } }
            : {}),
          ...(input.idempotencyKey
            ? { headers: { IdempotencyKey: input.idempotencyKey } }
            : {}),
        }),
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new EmailAcceptanceUncertainError(
        "Brevo acceptance uncertain; verify provider logs before retrying.",
      );
    }
    if (response.status >= 500) {
      throw new EmailAcceptanceUncertainError(
        "Brevo acceptance uncertain; verify provider logs before retrying.",
      );
    }
    if (!response.ok) {
      throw new Error(`Brevo rejected email (HTTP ${response.status}).`);
    }
    let result: { messageId?: string };
    try {
      result = await response.json();
    } catch {
      throw new EmailAcceptanceUncertainError(
        "Brevo returned an unreadable acceptance response.",
      );
    }
    if (!result.messageId)
      throw new EmailAcceptanceUncertainError(
        "Brevo did not return a message ID.",
      );
    return { id: result.messageId, dryRun: false };
  }

  const resend = new Resend(apiKey!);
  const { data, error } = await resend.emails.send(
    {
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );

  if (error) {
    throw new Error(error.message);
  }

  return { id: data?.id ?? null, dryRun: false };
}
