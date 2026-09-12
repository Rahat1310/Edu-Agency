import { Resend } from "resend";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  idempotencyKey?: string;
};

export type SendEmailResult = {
  id: string | null;
  dryRun: boolean;
};

/**
 * Transactional email via Resend (Section 4 / 6.3). Missing `RESEND_API_KEY`
 * is a dry-run so local jobs and tests can run without sending.
 */
export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey) {
    console.info("[email] dry-run (RESEND_API_KEY unset)", {
      to: input.to,
      subject: input.subject,
    });
    return { id: null, dryRun: true };
  }

  if (!from) {
    throw new Error(
      "EMAIL_FROM is missing. Add it to .env.local (see .env.example).",
    );
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(
    {
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );

  if (error) {
    throw new Error(error.message);
  }

  return { id: data?.id ?? null, dryRun: false };
}
