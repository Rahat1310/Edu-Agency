import assert from "node:assert/strict";
import { test } from "node:test";

import {
  explainChooseFileProblem,
  explainUploadProblem,
} from "@/lib/documents/upload-errors";

test("empty and oversized files are explained before any upload", () => {
  const empty = explainChooseFileProblem(new File([], "blank.pdf"), 10);
  assert.equal(empty?.kind, "other");
  assert.match(empty?.title ?? "", /empty/i);

  const big = explainChooseFileProblem(
    new File([new Uint8Array(20)], "scan.pdf"),
    10,
  );
  assert.equal(big?.kind, "too-large");
  assert.match(big?.description ?? "", /compress|photograph/i);
});

test("maps too-large, wrong-type, network, and timeout to actionable copy", () => {
  const large = explainUploadProblem({
    stage: "start",
    status: 400,
    serverMessage: "That file is over 10 MB.",
  });
  assert.equal(large.kind, "too-large");

  const type = explainUploadProblem({
    stage: "save",
    status: 400,
    serverMessage: "Send a PDF, JPG, or PNG — nothing else.",
  });
  assert.equal(type.kind, "wrong-type");

  const network = explainUploadProblem({
    stage: "put",
    error: new TypeError("Failed to fetch"),
  });
  assert.equal(network.kind, "network");
  assert.match(network.title, /network dropped/i);

  const timeout = explainUploadProblem({
    stage: "put",
    error: new Error("timeout"),
  });
  assert.equal(timeout.kind, "timeout");
});

test("never falls back to a generic something-went-wrong", () => {
  const unknown = explainUploadProblem({ stage: "start", status: 500 });
  assert.doesNotMatch(unknown.title, /something went wrong/i);
  assert.doesNotMatch(unknown.description, /something went wrong/i);
  assert.match(unknown.description, /whatsapp/i);
});
