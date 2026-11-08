import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { runEval } = await load(import.meta.url, "P29-E19.ts");
const cases = [
  { name: "שעות", input: "hours", check: (o) => o === "9-17" },
  { name: "החזר", input: "refund", check: (o) => (o === "14 days" ? true : `קיבלנו "${o}"`) },
  { name: "קורס", input: "boom", check: () => true },
  { name: "ריק", input: "empty", check: (o) => Boolean(o) },
];
const answers = { hours: "9-17", refund: "30 days", empty: "" };

test("ציון, וכל כישלון עם סיבה", async () => {
  const r = await runEval(cases, async (q) => { if (q === "boom") throw new Error("timeout"); return answers[q]; });
  assert.equal(r.passed, 1);
  assert.equal(r.total, 4);
  assert.equal(r.score, 0.25);
  assert.deepEqual(r.failures.map((f) => f.name), ["החזר", "קורס", "ריק"], "בסדר המקרים");
  assert.match(r.failures[0].reason, /30 days/);
  assert.match(r.failures[1].reason, /timeout/);
});
test("רץ במקביל עד concurrency", async () => {
  let active = 0;
  let peak = 0;
  const many = Array.from({ length: 10 }, (_, i) => ({ name: String(i), input: i, check: () => true }));
  await runEval(many, async () => { active++; peak = Math.max(peak, active); await new Promise((r) => setTimeout(r, 10)); active--; return 1; }, { concurrency: 3 });
  assert.equal(peak, 3);
  assert.deepEqual(await runEval([], async () => 1), { passed: 0, total: 0, score: 0, failures: [] });
});
