import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { repoName } = await load(import.meta.url, "P30-E39.ts");

test("דוגמאות", () => {
  assert.equal(repoName("Coffee Shop API (NestJS)!"), "coffee-shop-api-nestjs");
  assert.equal(repoName("tasks_api v2.0"), "tasks-api-v2-0");
  assert.equal(repoName("  --Hello   World--  "), "hello-world");
  assert.equal(repoName("חנות קפה API"), "api");
  assert.equal(repoName("a.b_c d"), "a-b-c-d");
});
test("עד 40 תווים, בלי מקף בסוף", () => {
  assert.equal(repoName("x".repeat(50)), "x".repeat(40));
  const r = repoName("a".repeat(39) + " b c");
  assert.equal(r, "a".repeat(39));
  assert.ok(repoName("Event Sourcing Order Service For The Coffee Shop Project").length <= 40);
  assert.equal(repoName("Event Sourcing Order Service For The Coffee Shop Project"), "event-sourcing-order-service-for-the-cof");
});
test("ריק ← שגיאה", () => {
  for (const t of ["", "   ", "!!!", "חנות קפה", "---"]) assert.throws(() => repoName(t), Error, JSON.stringify(t));
});
