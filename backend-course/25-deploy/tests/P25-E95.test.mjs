import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25-E95.ts", ["generateSecret", "secretProblems"]);

test("generateSecret", async () => {
  const { generateSecret, secretProblems } = await get();
  const a = generateSecret();
  assert.match(a, /^[A-Za-z0-9_-]{64}$/, "48 בתים ← 64 תווי base64url");
  assert.notEqual(generateSecret(), a, "אקראי");
  assert.match(generateSecret(32), /^[A-Za-z0-9_-]{43}$/);
  assert.throws(() => generateSecret(16), RangeError);
  for (let i = 0; i < 20; i++) assert.deepEqual(secretProblems(generateSecret()), []);
});
test("secretProblems", async () => {
  const { secretProblems } = await get();
  assert.deepEqual(secretProblems("short"), ["too-short", "low-variety"]);
  assert.deepEqual(secretProblems("dev-only-secret-not-for-production!!"), ["placeholder"]);
  assert.deepEqual(secretProblems("CHANGEME-" + "k2Jd8sLq0pWz7xYvB4nM1234"), ["placeholder"]);
  assert.deepEqual(secretProblems("a".repeat(40)), ["low-variety"]);
  assert.deepEqual(secretProblems("k2Jd8sLq0pWz7xYvB4nMk2Jd8sLq0pWz7xYvB4nM\n"), ["whitespace"]);
  assert.deepEqual(secretProblems(" k2Jd8sLq0pWz7xYvB4nMk2Jd8sLq0pWz"), ["whitespace"]);
  assert.deepEqual(secretProblems("k2Jd8sLq0pWz7xYvB4nMk2Jd8sLq0pWz"), []);
});
