import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { runEvals } = await load(import.meta.url, "P29-E102.ts");
const cases = [
  { input: "חויבתי פעמיים", expected: "billing" },
  { input: "החבילה לא הגיעה", expected: "shipping" },
  { input: "שאלה כללית", expected: "other" },
  { input: "החזר כספי", expected: "billing" },
];

test("מודל שעונה נכון ← 100%", async () => {
  const answers = { "חויבתי פעמיים": " Billing\n", "החבילה לא הגיעה": "shipping", "שאלה כללית": "OTHER", "החזר כספי": "billing" };
  const r = await runEvals(cases, async (i) => answers[i]);
  assert.deepEqual(r, { passed: 4, failed: 0, accuracy: 1, failures: [] });
});
test("3 מתוך 4 ← 0.75", async () => {
  const r = await runEvals(cases, async (i) => (i === "החזר כספי" ? "other" : cases.find((c) => c.input === i).expected));
  assert.equal(r.accuracy, 0.75);
  assert.deepEqual(r.failures, [{ input: "החזר כספי", expected: "billing", got: "other" }]);
});
test("קריאה שנכשלת ← ERROR, וממשיכים", async () => {
  const r = await runEvals(cases, async (i) => {
    if (i === "החבילה לא הגיעה") throw new Error("429 rate limit");
    return cases.find((c) => c.input === i).expected;
  });
  assert.deepEqual(r, { passed: 3, failed: 1, accuracy: 0.75, failures: [{ input: "החבילה לא הגיעה", expected: "shipping", got: "ERROR" }] });
});
test("שליש, ואין מקרים", async () => {
  const three = cases.slice(0, 3);
  assert.equal((await runEvals(three, async () => "billing")).accuracy, 0.33);
  assert.deepEqual(await runEvals([], async () => "x"), { passed: 0, failed: 0, accuracy: 0, failures: [] });
});
