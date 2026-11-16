import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { assignStories } = await load(import.meta.url, "P30-E76.ts");
const S = [
  { id: "oversell", tags: ["bug", "testing", "concurrency"] },
  { id: "tls", tags: ["mistake", "security"] },
  { id: "ci-red", tags: ["bug", "mistake", "debugging"] },
  { id: "redis-self", tags: ["learning"] },
];

test("שיבוץ לפי תגיות, שימושים וסדר", () => {
  const Q = [
    { id: "bug", tags: ["bug"] },
    { id: "wrong", tags: ["mistake"] },
    { id: "hard-bug", tags: ["bug", "debugging"] },
    { id: "learn", tags: ["learning"] },
    { id: "conflict", tags: ["team"] },
    { id: "bug2", tags: ["bug"] },
    { id: "bug3", tags: ["bug"] },
    { id: "bug4", tags: ["bug"] },
  ];
  assert.deepEqual(assignStories(Q, S), { bug: "oversell", wrong: "tls", "hard-bug": "ci-red", learn: "redis-self", conflict: null, bug2: "oversell", bug3: "ci-red", bug4: null });
});
test("maxUses", () => {
  const Q = [{ id: "a", tags: ["learning"] }, { id: "b", tags: ["learning"] }];
  assert.deepEqual(assignStories(Q, S, 1), { a: "redis-self", b: null });
  assert.deepEqual(assignStories([], S), {});
  assert.deepEqual(assignStories([{ id: "x", tags: ["bug"] }], []), { x: null });
});
