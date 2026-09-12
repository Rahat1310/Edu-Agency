import { getStudentApplication } from "@/lib/auth-helpers";
import { getOwnedDocument } from "@/lib/documents/list";
import {
  grantDocumentView,
  viewGrantErrorResponse,
} from "@/lib/documents/view-grant";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const linked = await getStudentApplication();
  if (!linked) {
    return Response.json(
      { ok: false, message: "Sign in to your student file first." },
      { status: 401 },
    );
  }

  const limited = await rateLimit("document-view", linked.user.id);
  if (!limited.allowed) {
    return Response.json(
      { ok: false, message: "Please wait before opening another file." },
      { status: 429 },
    );
  }

  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return Response.json(
      { ok: false, message: "That document was not found." },
      { status: 404 },
    );
  }

  const row = await getOwnedDocument(id, linked.application.id);
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
