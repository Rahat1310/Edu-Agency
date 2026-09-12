import assert from "node:assert/strict";
import { test } from "node:test";

import { createMemoryFaqCache } from "@/lib/ai/faq-cache";
import type { AiMessage } from "@/lib/ai/types";
import { capShortlist, levelsForEducation } from "@/lib/matching/filters";
import {
  MATCH_SHORTLIST_CAP,
  parseStudentMatchProfile,
  profileFromLeadContext,
  profileHash,
  type StudentMatchProfile,
} from "@/lib/matching/profile";
import {
  matchingUserPrompt,
  parseShortlistFromUserPrompt,
} from "@/lib/matching/prompt";
import {
  rankProgramMatches,
  type MatchingCompleteFn,
} from "@/lib/matching/rank";
import type { MatchingShortlistProgram } from "@/lib/matching/types";

const profile: StudentMatchProfile = {
  educationLevel: "bachelor",
  destinations: ["china"],
  ielts: 6.5,
  budget: "15_25l",
};

function uuid(n: number): string {
  return `11111111-1111-4111-8111-${String(n).padStart(12, "0")}`;
}

function program(
  n: number,
  country: MatchingShortlistProgram["country"] = "china",
): MatchingShortlistProgram {
  return {
    id: uuid(n),
    universityName: `University ${n}`,
    country,
    level: "master",
    field: "Computer Science",
    tuitionAmount: "20000.00",
    tuitionCurrency: "CNY",
  };
}

const catalog = Array.from({ length: 40 }, (_, index) => program(index + 1));

test("hard filters cap the shortlist at 20 before any model call", () => {
  assert.equal(MATCH_SHORTLIST_CAP, 20);
  assert.equal(capShortlist(catalog).length, 20);
  assert.deepEqual(levelsForEducation("hsc"), [
    "bachelor",
    "diploma",
    "language",
  ]);
});

test("the matching gateway payload contains only the pre-filtered shortlist", async () => {
  const extra = catalog[35];
  assert.ok(extra);
  const first = catalog[0];
  const second = catalog[1];
  assert.ok(first && second);

  let captured: readonly AiMessage[] | undefined;
  const complete: MatchingCompleteFn = async (task, messages) => {
    assert.equal(task, "matching");
    captured = messages;
    return {
      text: JSON.stringify({
        matches: [
          { id: first.id, reason: "China master programs fit this file." },
          {
            id: extra.id,
            reason: "Invented program outside the shortlist.",
          },
          {
            id: second.id,
            reason: "Tuition sits inside the stated budget band.",
          },
        ],
      }),
      provider: "gemini",
      tokensIn: 40,
      tokensOut: 20,
    };
  };

  const result = await rankProgramMatches(
    { profile },
    {
      complete,
      cache: createMemoryFaqCache(),
      loadShortlist: async () => catalog,
    },
  );

  assert.ok(captured);
  const user = captured.find((message) => message.role === "user");
  assert.ok(user);
  const capped = catalog.slice(0, MATCH_SHORTLIST_CAP);
  const payloadIds = parseShortlistFromUserPrompt(user.content);

  assert.equal(payloadIds.length, MATCH_SHORTLIST_CAP);
  assert.deepEqual(
    payloadIds,
    capped.map((item) => item.id),
  );
  assert.equal(payloadIds.includes(extra.id), false);
  assert.equal(user.content, matchingUserPrompt(profile, capped));
  assert.deepEqual(
    result.matches.map((item) => item.id),
    [first.id, second.id],
  );
  assert.equal(
    result.matches.some((item) => item.id === extra.id),
    false,
  );
});

test("reopening with the same profile serves the cache and does not call the model", async () => {
  const cache = createMemoryFaqCache();
  let completeCalls = 0;
  let shortlistCalls = 0;
  const firstProgram = catalog[0];
  assert.ok(firstProgram);

  const deps = {
    complete: async () => {
      completeCalls += 1;
      return {
        text: JSON.stringify({
          matches: [
            { id: firstProgram.id, reason: "Fits China and the budget band." },
          ],
        }),
        provider: "gemini" as const,
        tokensIn: 10,
        tokensOut: 8,
      };
    },
    cache,
    loadShortlist: async () => {
      shortlistCalls += 1;
      return catalog.slice(0, 8);
    },
  };

  const first = await rankProgramMatches({ profile }, deps);
  const second = await rankProgramMatches({ profile }, deps);

  assert.equal(completeCalls, 1);
  assert.equal(shortlistCalls, 1);
  assert.equal(first.cached, false);
  assert.equal(second.cached, true);
  assert.equal(second.matches[0]?.reason, first.matches[0]?.reason);
  assert.equal(second.profileHash, profileHash(profile));
});

test("updating the profile or clicking refresh recomputes", async () => {
  const cache = createMemoryFaqCache();
  const reasons: string[] = [];
  const complete: MatchingCompleteFn = async (_task, messages) => {
    const user = messages.find((message) => message.role === "user");
    const label = user?.content.includes('"ielts":7') ? "updated" : "original";
    reasons.push(label);
    const first = catalog[0];
    assert.ok(first);
    return {
      text: JSON.stringify({
        matches: [{ id: first.id, reason: label }],
      }),
      provider: "gemini",
      tokensIn: 10,
      tokensOut: 8,
    };
  };

  const deps = {
    complete,
    cache,
    loadShortlist: async () => catalog.slice(0, 5),
  };

  await rankProgramMatches({ profile }, deps);
  await rankProgramMatches({ profile, refresh: true }, deps);

  const updated = { ...profile, ielts: 7 };
  await rankProgramMatches({ profile: updated }, deps);

  assert.deepEqual(reasons, ["original", "original", "updated"]);
  assert.notEqual(profileHash(profile), profileHash(updated));
});

test("an empty shortlist never calls the model and is not cached", async () => {
  let completeCalls = 0;
  let shortlistCalls = 0;
  const deps = {
    complete: async () => {
      completeCalls += 1;
      throw new Error("model should not run for an empty shortlist");
    },
    cache: createMemoryFaqCache(),
    loadShortlist: async () => {
      shortlistCalls += 1;
      return [];
    },
  };

  const first = await rankProgramMatches({ profile }, deps);
  const second = await rankProgramMatches({ profile }, deps);

  assert.equal(first.emptyShortlist, true);
  assert.equal(second.emptyShortlist, true);
  assert.equal(completeCalls, 0);
  assert.equal(shortlistCalls, 2);
});

test("parseStudentMatchProfile reads quiz answers with a single destination", () => {
  assert.equal(parseStudentMatchProfile({ educationLevel: "hsc" }), null);
  const fromQuiz = profileFromLeadContext({
    savedProfile: null,
    quizAnswers: {
      educationLevel: "hsc",
      destination: "malaysia",
      budget: "8_15l",
      ielts: 6,
    },
    destinationInterest: "undecided",
  });
  assert.deepEqual(fromQuiz?.destinations, ["malaysia"]);
  assert.equal(fromQuiz?.educationLevel, "hsc");
});
