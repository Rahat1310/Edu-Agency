import { submitEligibilityQuiz } from "@/lib/leads/submit-quiz";
import type { QuizSubmitResult } from "@/lib/leads/submit-quiz";
import { getRequestIp } from "@/lib/request-ip";

export const runtime = "nodejs";

function statusFor(result: QuizSubmitResult): number {
  if (result.ok) {
    return 200;
  }

  switch (result.code) {
    case "rate_limit":
      return 429;
    case "config":
    case "server":
      return 503;
    default:
      return 400;
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        code: "validation",
        message: "Validation failed",
        fields: { _root: ["Send a JSON body"] },
      },
      { status: 400 },
    );
  }

  const result = await submitEligibilityQuiz(body, getRequestIp(request));

  return Response.json(result, { status: statusFor(result) });
}
