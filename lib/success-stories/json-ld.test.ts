import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/i18n/en";
import type { PublicSuccessStory } from "@/lib/success-stories/featured";
import {
  successStoriesItemListJsonLd,
  successStoryReviewJsonLd,
} from "@/lib/success-stories/json-ld";

const story: PublicSuccessStory = {
  id: "11111111-1111-4111-8111-111111111111",
  studentName: "Ayesha R.",
  destination: "china",
  university: "Tsinghua University",
  program: "Computer Science",
  photoR2Key: null,
  quote:
    "Placeholder — the counselor mapped the JW202 sequence before we paid.",
  createdAt: new Date("2026-03-01T00:00:00.000Z"),
};

test("published stories emit schema.org Review of the university", () => {
  const jsonLd = successStoryReviewJsonLd(story, en, "https://example.com");

  assert.equal(jsonLd["@type"], "Review");
  assert.equal(jsonLd.author.name, "Ayesha R.");
  assert.equal(jsonLd.reviewBody, story.quote);
  assert.equal(jsonLd.itemReviewed["@type"], "CollegeOrUniversity");
  assert.equal(jsonLd.itemReviewed.name, "Tsinghua University");
  assert.equal(jsonLd.itemReviewed.address.addressCountry, "CN");
  assert.equal(jsonLd.publisher.name, en.meta.siteName);
});

test("listing page wraps reviews in an ItemList", () => {
  const jsonLd = successStoriesItemListJsonLd(
    [story],
    en,
    "https://example.com",
    "https://example.com/success-stories",
  );

  assert.equal(jsonLd["@type"], "ItemList");
  assert.equal(jsonLd.itemListElement.length, 1);
  assert.equal(jsonLd.itemListElement[0]?.item["@type"], "Review");
});
