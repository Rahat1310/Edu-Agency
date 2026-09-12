export type SendSmsInput = {
  to: string;
  message: string;
};

export type SendSmsResult = {
  dryRun: boolean;
};

/**
 * Local Bangladeshi SMS aggregator (Section 4 / 6.4). Missing URL or key is a
 * dry-run so the scheduled job can still log `reminders_sent` locally.
 */
export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const url = process.env.SMS_API_URL?.trim();
  const apiKey = process.env.SMS_API_KEY?.trim();
  const senderId = process.env.SMS_SENDER_ID?.trim();

  if (!url || !apiKey) {
    console.info("[sms] dry-run (SMS_API_URL or SMS_API_KEY unset)", {
      to: input.to,
    });
    return { dryRun: true };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to: input.to,
      message: input.message,
      senderId: senderId || undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `SMS aggregator responded ${response.status}: ${body.slice(0, 200)}`,
    );
  }

  return { dryRun: false };
}
