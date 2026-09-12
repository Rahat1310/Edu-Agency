import assert from "node:assert/strict";
import { test } from "node:test";

import { renderNurtureTemplate } from "@/lib/nurture/copy";
import { nurtureSequence } from "@/lib/nurture/sequence";

test("nurture copy names the student and never invents an admission chance", () => {
  const step = nurtureSequence[0];
  assert.ok(step);

  const body = renderNurtureTemplate(step.emailBody, {
    name: "Ayesha",
    destinationInterest: "south_korea",
  });

  assert.match(body, /Ayesha/);
  assert.match(body, /South Korea/);
  assert.match(body, /\/portal/);
  assert.equal(/chance|likely|admit/i.test(body), false);
  assert.match(body, /not an admission decision/i);
});
