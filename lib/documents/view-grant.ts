import "server-only";

import {
  DOCUMENT_VIEW_EXPIRES_SECONDS,
  extensionForMime,
  mimeForExtension,
} from "@/lib/documents/constants";
import { parseDocumentKey } from "@/lib/documents/keys";
import { R2ConfigError, presignDocumentGet } from "@/lib/r2";

export type DocumentViewGrant = {
  url: string;
  expiresAt: string;
  expiresInSeconds: number;
};

function mimeFromKey(key: string) {
  const parsed = parseDocumentKey(key);
  return mimeForExtension(parsed?.extension ?? "pdf") ?? "application/pdf";
}

export async function grantDocumentView(input: {
  r2Key: string;
  filename: string;
}): Promise<DocumentViewGrant> {
  const contentType = mimeFromKey(input.r2Key);
  const filename =
    input.filename.trim() || `document.${extensionForMime(contentType)}`;
  const url = await presignDocumentGet({
    key: input.r2Key,
    filename,
    contentType,
    expiresIn: DOCUMENT_VIEW_EXPIRES_SECONDS,
  });

  return {
    url,
    expiresAt: new Date(
      Date.now() + DOCUMENT_VIEW_EXPIRES_SECONDS * 1000,
    ).toISOString(),
    expiresInSeconds: DOCUMENT_VIEW_EXPIRES_SECONDS,
  };
}

export function viewGrantErrorResponse(error: unknown): Response {
  if (error instanceof R2ConfigError) {
    return Response.json(
      {
        ok: false,
        message: "We can't open files right now. Try again later.",
      },
      { status: 503 },
    );
  }

  return Response.json(
    { ok: false, message: "We could not open that file." },
    { status: 503 },
  );
}
