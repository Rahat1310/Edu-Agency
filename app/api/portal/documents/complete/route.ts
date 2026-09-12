import { revalidatePath } from "next/cache";

import { getStudentApplication } from "@/lib/auth-helpers";
import { requireOwnedApplication } from "@/lib/documents/access";
import {
  isAllowedDocumentMime,
  mimeForExtension,
} from "@/lib/documents/constants";
import {
  parseDocumentKey,
  sanitizeDocumentFilename,
  sniffDocumentMime,
} from "@/lib/documents/keys";
import { insertVerifiedDocument } from "@/lib/documents/list";
import { rateLimit } from "@/lib/rate-limit";
import {
  R2ConfigError,
  deleteDocumentObject,
  headDocumentObject,
  isWithinUploadCap,
  readDocumentPrefix,
} from "@/lib/r2";
import { createDocumentCompleteSchema } from "@/lib/schemas/document";
import { validateRequest } from "@/lib/validation-helpers";
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
  const parsed = validateRequest(
    createDocumentCompleteSchema(extraTypeKeys),
    body,
  );
  if (!parsed.success) {
    return Response.json(
      { ok: false, message: "That upload could not be recorded." },
      { status: 400 },
    );
  }

  const access = await requireOwnedApplication(parsed.data.applicationId);
  if (!access.ok) {
    return Response.json(
      { ok: false, message: access.message },
      { status: access.status },
    );
  }

  const filename = sanitizeDocumentFilename(
    parsed.data.filename,
    parsed.data.contentType,
  );
  if (!filename) {
    return Response.json(
      {
        ok: false,
        message:
          "That filename isn't allowed. Use a PDF, JPG, or PNG with a matching extension.",
      },
      { status: 400 },
    );
  }

  const applicationId = access.application.application.id;
  const parsedKey = parseDocumentKey(parsed.data.key);

  const keyMime = parsedKey ? mimeForExtension(parsedKey.extension) : null;

  if (
    !parsedKey ||
    !keyMime ||
    parsedKey.applicationId !== applicationId ||
    parsedKey.type !== parsed.data.type ||
    keyMime !== parsed.data.contentType
  ) {
    return Response.json(
      { ok: false, message: "That upload does not belong to your file." },
      { status: 403 },
    );
  }

  try {
    const headed = await headDocumentObject(parsed.data.key);
    if (!headed) {
      return Response.json(
        {
          ok: false,
          message: "We couldn't find that upload. Try sending the file again.",
        },
        { status: 400 },
      );
    }

    if (
      headed.contentLength !== parsed.data.size ||
      !isWithinUploadCap(headed.contentLength)
    ) {
      await deleteDocumentObject(parsed.data.key);
      return Response.json(
        { ok: false, message: "That file didn't match the size we expected." },
        { status: 400 },
      );
    }

    const storedType = headed.contentType?.split(";")[0]?.trim().toLowerCase();
    if (storedType && !isAllowedDocumentMime(storedType)) {
      await deleteDocumentObject(parsed.data.key);
      return Response.json(
        { ok: false, message: "Send a PDF, JPG, or PNG — nothing else." },
        { status: 400 },
      );
    }

    const prefix = await readDocumentPrefix(parsed.data.key);
    const sniffed = prefix ? sniffDocumentMime(prefix) : null;
    if (!sniffed || sniffed !== parsed.data.contentType) {
      await deleteDocumentObject(parsed.data.key);
      return Response.json(
        {
          ok: false,
          message:
            "That file isn't a real PDF, JPG, or PNG, so it was not saved.",
        },
        { status: 400 },
      );
    }

    const document = await insertVerifiedDocument({
      applicationId,
      type: parsed.data.type,
      filename,
      r2Key: parsed.data.key,
    });

    revalidatePath("/portal");
    revalidatePath("/portal/documents");

    return Response.json({ ok: true, document });
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
      { ok: false, message: "We could not save that file. Try again." },
      { status: 503 },
    );
  }
}
