import { randomUUID } from "node:crypto";

import type { DocumentType } from "@/db/schema";
import {
  extensionForMime,
  type DocumentMimeType,
} from "@/lib/documents/constants";
import { DOCUMENT_TYPE_KEY_PATTERN } from "@/lib/documents/type-key";

const UUID_RE = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const TYPE_RE = "[a-z][a-z0-9_]{0,62}";

const KEY_RE = new RegExp(
  `^applications\\/(${UUID_RE})\\/(${TYPE_RE})\\/(${UUID_RE})\\.(pdf|jpg|png)$`,
);

const EXECUTABLE_OR_SCRIPT_EXT = new Set([
  "exe",
  "bat",
  "cmd",
  "com",
  "cpl",
  "dll",
  "dmg",
  "iso",
  "jar",
  "js",
  "jse",
  "msi",
  "msp",
  "pif",
  "ps1",
  "scr",
  "sh",
  "vbs",
  "vbe",
  "wasm",
  "apk",
  "app",
  "deb",
  "rpm",
  "php",
  "asp",
  "aspx",
  "cgi",
  "pl",
  "py",
  "rb",
  "html",
  "htm",
  "svg",
  "hta",
]);

export type ParsedDocumentKey = {
  applicationId: string;
  type: DocumentType;
  objectId: string;
  extension: "pdf" | "jpg" | "png";
};

export function sanitizeDocumentFilename(
  raw: string,
  contentType: DocumentMimeType,
): string | null {
  const base = raw.replaceAll("\\", "/").split("/").pop()?.trim() ?? "";
  if (!base || base === "." || base.includes("..")) {
    return null;
  }

  if (base.length > 180) {
    return null;
  }

  if (!/^[A-Za-z0-9._ ()-]+$/.test(base)) {
    return null;
  }

  const parts = base.toLowerCase().split(".");
  if (parts.length !== 2) {
    return null;
  }

  const ext = parts[1];
  if (!ext || EXECUTABLE_OR_SCRIPT_EXT.has(ext)) {
    return null;
  }

  const expected = extensionForMime(contentType);
  if (ext !== expected && !(contentType === "image/jpeg" && ext === "jpeg")) {
    return null;
  }

  return base;
}

export function buildDocumentKey(input: {
  applicationId: string;
  type: DocumentType;
  contentType: DocumentMimeType;
}): string {
  const extension = extensionForMime(input.contentType);
  return `applications/${input.applicationId}/${input.type}/${randomUUID()}.${extension}`;
}

export function parseDocumentKey(key: string): ParsedDocumentKey | null {
  const match = KEY_RE.exec(key);
  if (!match) {
    return null;
  }

  const applicationId = match[1];
  const type = match[2];
  const objectId = match[3];
  const extension = match[4];

  if (
    !applicationId ||
    !type ||
    !objectId ||
    !extension ||
    !DOCUMENT_TYPE_KEY_PATTERN.test(type)
  ) {
    return null;
  }

  return {
    applicationId,
    type: type as DocumentType,
    objectId,
    extension: extension as "pdf" | "jpg" | "png",
  };
}

export function sniffDocumentMime(bytes: Uint8Array): DocumentMimeType | null {
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return "application/pdf";
  }

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  return null;
}
