import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { headlineIssues } = await load(import.meta.url, "P30-E56.ts");

test("כל המקרים", () => {
  assert.deepEqual(headlineIssues("Backend Developer · Node.js, TypeScript, NestJS, PostgreSQL"), []);
  assert.deepEqual(headlineIssues("   "), ["empty"]);
  assert.deepEqual(headlineIssues("Looking for my first job in tech | Career changer | Passionate about coding 🚀"), ["no_backend", "job_seeking"]);
  assert.deepEqual(headlineIssues("Junior BACKEND dev, seeking new role"), ["job_seeking"]);
  assert.deepEqual(headlineIssues("מפתח Backend מחפש עבודה"), ["job_seeking"]);
  assert.deepEqual(headlineIssues("Backend · Node · TS · Nest · PG · Redis · Docker"), ["too_many_items"]);
  assert.deepEqual(headlineIssues("Backend · Node · TS · Nest · PG · Redis"), [], "בדיוק 6");
  assert.deepEqual(headlineIssues("Backend " + "x".repeat(213)), ["too_long"]);
  assert.deepEqual(headlineIssues("Backend " + "x".repeat(212)), [], "בדיוק 220");
  assert.deepEqual(headlineIssues("Backend ,, | · , Node"), [], "פריטים ריקים לא נספרים");
});
test("פריטים ריקים לא נספרים", () => {
  assert.ok(!headlineIssues("Backend · Node.js · TS · SQL · Redis · Docker · ").includes("too_many_items"), "6 פריטים ו־· בסוף — לא 7");
});
