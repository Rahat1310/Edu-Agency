import { getDashboardUser } from "@/lib/auth-helpers";
import { getDocumentForLead } from "@/lib/documents/list";
import {
  grantDocumentView,
  viewGrantErrorResponse,
} from "@/lib/documents/view-grant";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const user = await getDashboardUser();
  if (!user) {
    return Response.json(
      { ok: false, message: "Sign in to the desk to open this file." },
      { status: 403 },
    );
  }

  const limited = await rateLimit("document-counselor-view", user.id);
  if (!limited.allowed) {
    return Response.json(
      { ok: false, message: "Please wait before opening another file." },
      { status: 429 },
    );
  }

  const { id } = await context.params;
  const leadId = new URL(request.url).searchParams.get("leadId") ?? "";

  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(leadId)) {
    return Response.json(
      { ok: false, message: "That document was not found." },
      { status: 404 },
    );
  }

  const row = await getDocumentForLead(id, leadId);
  if (!row) {
    return Response.json(
      { ok: false, message: "That document was not found." },
      { status: 404 },
    );
  }

  try {
    const grant = await grantDocumentView({
      r2Key: row.r2Key,
      filename: row.filename,
    });

    return Response.json({ ok: true, ...grant });
  } catch (error) {
    return viewGrantErrorResponse(error);
  }
}
