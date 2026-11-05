import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AssessmentConfirmation } from "./assessment-confirmation";
import { defaultCounsellor } from "@/lib/consultation/counsellor";

test("saved assessment shows assigned counsellor and working contact links", () => {
  const html = renderToStaticMarkup(
    createElement(AssessmentConfirmation, {
      locale: "en",
      confirmation: {
        firstName: "Test",
        reference: "SAC-TEST-123",
        counselor: defaultCounsellor,
      },
    }),
  );
  assert.match(html, /Your counsellor has been assigned!/);
  assert.match(html, /Your answers have been saved/);
  assert.match(html, /MD DIDARUL ISLAM NISHAD/);
  assert.match(html, /Senior Student Counsellor/);
  assert.match(html, /01765926697/);
  assert.match(html, /href="tel:\+8801765926697"/);
  assert.match(html, /https:\/\/wa.me\/8801765926697\?text=/);
  assert.match(html, /SAC-TEST-123/);
  assert.match(html, /id="assessment-success-heading" tabindex="-1"/);
});

test("legacy unassigned confirmation does not claim a counsellor was assigned", () => {
  const html = renderToStaticMarkup(
    createElement(AssessmentConfirmation, {
      locale: "en",
      confirmation: {
        firstName: "Test",
        reference: "SAC-TEST",
        counselor: null,
      },
    }),
  );
  assert.doesNotMatch(html, /Your counsellor has been assigned!/);
  assert.match(html, /Our team will assign a counsellor shortly/);
});

test("Bangla confirmation shows translated assignment message", () => {
  const html = renderToStaticMarkup(
    createElement(AssessmentConfirmation, {
      locale: "bn",
      confirmation: {
        firstName: "Test",
        reference: "SAC-TEST",
        counselor: defaultCounsellor,
      },
    }),
  );
  assert.match(html, /আপনার কাউন্সেলর নিয়োগ করা হয়েছে!/);
  assert.match(html, /MD DIDARUL ISLAM NISHAD/);
});
