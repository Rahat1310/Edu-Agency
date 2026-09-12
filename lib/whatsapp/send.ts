import { phoneDigits } from "@/lib/phone";

export type SendWhatsAppInput = {
  to: string;
  /** Session message inside the 24-hour customer-care window. */
  text?: string;
  template?: {
    name: string;
    language: string;
    bodyParameters: readonly string[];
  };
};

export type SendWhatsAppResult = {
  id: string | null;
  dryRun: boolean;
  mode: "session" | "template";
};

const GRAPH_VERSION = "v21.0";

/** E.164 digits without a leading plus, for Cloud API `to`. */
export function whatsappRecipient(raw: string): string {
  const digits = phoneDigits(raw);

  if (digits.startsWith("880")) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length >= 10) {
    return `880${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `880${digits}`;
  }

  return digits;
}

/**
 * WhatsApp Business Cloud API (Section 4 / 6.1). Missing token or phone
 * number ID is a dry-run so local jobs can still log activity.
 */
export async function sendWhatsAppMessage(
  input: SendWhatsAppInput,
): Promise<SendWhatsAppResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const to = whatsappRecipient(input.to);
  const mode: "session" | "template" = input.template ? "template" : "session";

  if (!token || !phoneNumberId) {
    console.info(
      "[whatsapp] dry-run (WHATSAPP_ACCESS_TOKEN or PHONE_NUMBER_ID unset)",
      { to, mode },
    );
    return { id: null, dryRun: true, mode };
  }

  if (!to) {
    throw new Error("WhatsApp recipient is empty.");
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;

  const payload = input.template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: input.template.name,
          language: { code: input.template.language },
          components: [
            {
              type: "body",
              parameters: input.template.bodyParameters.map((text) => ({
                type: "text",
                text,
              })),
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: input.text ?? "" },
      };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as {
    messages?: { id?: string }[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      body.error?.message ?? `WhatsApp Cloud API responded ${response.status}`,
    );
  }

  return {
    id: body.messages?.[0]?.id ?? null,
    dryRun: false,
    mode,
  };
}
