import assert from "node:assert/strict";
import { test } from "node:test";

import type { PublicSuccessStory } from "@/lib/success-stories/featured";
import {
  dailyRotationOffset,
  featuredWindowSize,
  filterStoriesByDestination,
  parseStoryDestination,
  rotateStories,
} from "@/lib/success-stories/featured";
import {
  isSafeMarketingPhotoKey,
  marketingAssetUrl,
  normalizeMarketingPhotoKey,
} from "@/lib/success-stories/photo";

function story(
  id: string,
  destination: PublicSuccessStory["destination"],
  publishedName: string,
): PublicSuccessStory {
  return {
    id,
    studentName: publishedName,
    destination,
    university: "Example University",
    program: "Computer Science",
    photoR2Key: null,
    quote: "Placeholder quote.",
    createdAt: null,
  };
}

const published = [
  story("1", "china", "Ayesha"),
  story("2", "india", "Rahim"),
  story("3", "malaysia", "Nabila"),
  story("4", "south_korea", "Farhan"),
  story("5", "china", "Tanvir"),
];

test("destination filter matches slug aliases and ignores other countries", () => {
  assert.equal(parseStoryDestination("south-korea"), "south_korea");
  assert.equal(parseStoryDestination("south_korea"), "south_korea");
  assert.equal(parseStoryDestination(""), "");
  assert.equal(parseStoryDestination("france"), "");

  const china = filterStoriesByDestination(published, "china");
  assert.equal(china.length, 2);
  assert.deepEqual(
    china.map((item) => item.studentName),
    ["Ayesha", "Tanvir"],
  );
});

test("featured window is 3–4 once enough stories exist", () => {
  assert.equal(featuredWindowSize(0), 0);
  assert.equal(featuredWindowSize(2), 2);
  assert.equal(featuredWindowSize(3), 3);
  assert.equal(featuredWindowSize(4), 4);
  assert.equal(featuredWindowSize(10), 4);
});

test("rotateStories wraps and never returns more than requested", () => {
  const fromStart = rotateStories(published, 0, 4);
  assert.deepEqual(
    fromStart.map((item) => item.studentName),
    ["Ayesha", "Rahim", "Nabila", "Farhan"],
  );

  const wrapped = rotateStories(published, 4, 4);
  assert.equal(wrapped.length, 4);
  assert.deepEqual(
    wrapped.map((item) => item.studentName),
    ["Tanvir", "Ayesha", "Rahim", "Nabila"],
  );
});

test("daily offset is stable for a Dhaka calendar date", () => {
  const morning = new Date("2026-08-16T02:00:00.000Z");
  const evening = new Date("2026-08-16T16:00:00.000Z");
  assert.equal(
    dailyRotationOffset(morning, published.length),
    dailyRotationOffset(evening, published.length),
  );
});

test("private document keys are never treated as marketing photos", () => {
  assert.equal(
    isSafeMarketingPhotoKey("applications/abc/passport/x.jpg"),
    false,
  );
  assert.equal(isSafeMarketingPhotoKey("success-stories/ayesha.jpg"), true);
  assert.equal(normalizeMarketingPhotoKey(""), null);
  assert.equal(
    normalizeMarketingPhotoKey("success-stories/ayesha.jpg"),
    "success-stories/ayesha.jpg",
  );
  assert.equal(
    normalizeMarketingPhotoKey(
      "https://cdn.example.com/success-stories/ayesha.jpg",
    ),
    "success-stories/ayesha.jpg",
  );
  assert.equal(
    marketingAssetUrl("success-stories/ayesha.jpg", "https://cdn.example.com"),
    "https://cdn.example.com/success-stories/ayesha.jpg",
  );
  assert.equal(marketingAssetUrl("success-stories/ayesha.jpg", ""), null);
  assert.equal(
    marketingAssetUrl(
      "applications/abc/passport/x.jpg",
      "https://cdn.example.com",
    ),
    null,
  );
});
