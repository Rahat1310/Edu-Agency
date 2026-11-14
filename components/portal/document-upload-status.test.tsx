import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DocumentUploadStatus } from "./document-upload-status";

test("missing and rejected documents show a red cross with a readable status", () => {
  for (const documents of [[], [{ status: "rejected" as const }]]) {
    const html = renderToStaticMarkup(
      createElement(DocumentUploadStatus, { documents }),
    );
    assert.match(html, /text-red-700/);
    assert.match(html, /lucide-circle-x/);
    assert.match(html, documents.length ? /Needs replacement/ : /Not uploaded/);
    assert.match(html, /role="status"/);
  }
});

test("pending and approved uploads show a green tick even alongside an older rejected file", () => {
  for (const status of ["pending", "approved"] as const) {
    const html = renderToStaticMarkup(
      createElement(DocumentUploadStatus, {
        documents: [{ status: "rejected" }, { status }],
      }),
    );
    assert.match(html, /text-emerald-700/);
    assert.match(html, /lucide-circle-check/);
    assert.match(
      html,
      status === "approved"
        ? /Uploaded · Approved/
        : /Uploaded · Awaiting review/,
    );
  }
});
