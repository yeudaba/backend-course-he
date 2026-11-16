import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { bulletIssues } = await load(import.meta.url, "P30-E53.ts");

test("נקודות טובות ← []", () => {
  assert.deepEqual(bulletIssues("Prevented overselling with a conditional UPDATE — verified with 20 concurrent orders for 3 units"), []);
  assert.deepEqual(bulletIssues("  Cut catalog search from ~80 ms to ~3 ms with a Redis cache "), []);
  assert.deepEqual(bulletIssues("Built, tested and deployed 22 endpoints"), [], "פסיק אחרי הפועל");
});
test("כל הבעיות", () => {
  assert.deepEqual(bulletIssues("Responsible for the backend of an online store"), ["weak_start", "no_number"]);
  assert.deepEqual(bulletIssues("worked with Docker and 2 CI pipelines"), ["weak_start"]);
  assert.deepEqual(bulletIssues("HELPED make the API faster"), ["weak_start", "no_number"]);
  assert.deepEqual(bulletIssues("Used Redis"), ["no_verb", "no_number"]);
  assert.deepEqual(bulletIssues("Redis cache cut latency by 90%"), ["no_verb"]);
  const long = "Implemented " + Array.from({ length: 30 }, (_, i) => `w${i}`).join(" ");
  assert.deepEqual(bulletIssues(long), ["too_long"]);
  assert.deepEqual(bulletIssues("Implemented " + Array.from({ length: 29 }, (_, i) => `w${i}`).join(" ")), [], "בדיוק 30 מילים");
  assert.deepEqual(bulletIssues(""), ["no_verb", "no_number"]);
});
