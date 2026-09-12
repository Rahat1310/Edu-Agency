import { answerMarketingChat } from "@/lib/ai/answer-chat";
import type { ChatApiResult } from "@/lib/ai/chat-types";
import { getFaqCache } from "@/lib/ai/faq-cache";
import { chatCompletion } from "@/lib/ai/gateway";
import { AiGatewayError } from "@/lib/ai/types";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { rateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { chatRequestSchema } from "@/lib/schemas/chat";
import { validateRequest } from "@/lib/validation-helpers";

export const runtime = "nodejs";
export const maxDuration = 60;

const RATE_LIMIT_MESSAGE =
  "Please wait before sending another question. You can try again later.";

const UNAVAILABLE_MESSAGE =
  "I cannot answer just now. Try WhatsApp, or leave a message on the contact form.";

function json(result: ChatApiResult, status: number): Response {
  return Response.json(result, { status });
}

export async function POST(request: Request): Promise<Response> {
  const limited = await rateLimit("chat", getRequestIp(request));

  if (!limited.allowed) {
    return json(
      { ok: false, code: "rate_limit", message: RATE_LIMIT_MESSAGE },
      429,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        code: "validation",
        message: "Send a JSON body",
      },
      400,
    );
  }

  const parsed = validateRequest(chatRequestSchema, body);

  if (!parsed.success) {
    return json(
      { ok: false, code: "validation", message: parsed.error.message },
      400,
    );
  }

  try {
    const answered = await answerMarketingChat(
      {
        message: parsed.data.message,
        locale: parsed.data.locale ?? DEFAULT_LOCALE,
      },
      { complete: chatCompletion, cache: getFaqCache() },
    );

    if (answered.emptyQuestion || (!answered.text && !answered.offerLead)) {
      return json(
        {
          ok: false,
          code: "validation",
          message: "Write a question first",
        },
        400,
      );
    }

    return json(
      {
        ok: true,
        text: answered.text,
        offerLead: answered.offerLead,
      },
      200,
    );
  } catch (error) {
    if (error instanceof AiGatewayError && error.code === "invalid_request") {
      return json(
        {
          ok: false,
          code: "validation",
          message: "Write a question first",
        },
        400,
      );
    }

    return json(
      { ok: false, code: "unavailable", message: UNAVAILABLE_MESSAGE },
      503,
    );
  }
}
