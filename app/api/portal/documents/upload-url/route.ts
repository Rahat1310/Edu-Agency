import { getStudentApplication } from "@/lib/auth-helpers";
import { DOCUMENT_UPLOAD_EXPIRES_SECONDS } from "@/lib/documents/constants";
import { buildDocumentKey } from "@/lib/documents/keys";
import { gateDocumentUploadIntent } from "@/lib/documents/upload-gate";
import { rateLimit } from "@/lib/rate-limit";
import { R2ConfigError, presignDocumentPut } from "@/lib/r2";
import { listPublishedVisaDocumentTypeKeys } from "@/lib/visa-requirements/load";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const linked = await getStudentApplication();
  if (!linked) {
    return Response.json(
      { ok: false, message: "Sign in to your student file first." },
      { status: 401 },
    );
  }

  const limited = await rateLimit("document-upload", linked.user.id);
  if (!limited.allowed) {
    return Response.json(
      { ok: false, message: "Please wait before uploading another file." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Send a JSON body." },
      { status: 400 },
    );
  }

  const extraTypeKeys = await listPublishedVisaDocumentTypeKeys();
  const gated = gateDocumentUploadIntent(
    linked.application.id,
    body,
    extraTypeKeys,
  );
  if (!gated.ok) {
    return Response.json(
      {
        ok: false,
        message: gated.message,
        ...(gated.fields ? { fields: gated.fields } : {}),
      },
      { status: gated.status },
    );
  }

  const key = buildDocumentKey({
    applicationId: linked.application.id,
    type: gated.data.type,
    contentType: gated.data.contentType,
  });

  try {
    const uploadUrl = await presignDocumentPut({
      key,
      contentType: gated.data.contentType,
      contentLength: gated.data.size,
      expiresIn: DOCUMENT_UPLOAD_EXPIRES_SECONDS,
    });

    return Response.json({
      ok: true,
      key,
      uploadUrl,
      headers: {
        "Content-Type": gated.data.contentType,
        "Content-Length": String(gated.data.size),
      },
      expiresInSeconds: DOCUMENT_UPLOAD_EXPIRES_SECONDS,
    });
  } catch (error) {
    if (error instanceof R2ConfigError) {
      return Response.json(
        {
          ok: false,
          message:
            "Uploads aren't available yet. WhatsApp us the file for now.",
        },
        { status: 503 },
      );
    }

    return Response.json(
      { ok: false, message: "We could not start that upload. Try again." },
      { status: 503 },
    );
  }
}
