import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { load } from "../../tools/load.mjs";

const { recorded } = await load(import.meta.url, "P29-E94.ts");

test("record ← replay, בלי קריאה במצב replay", async () => {
  const calls = [];
  const fn = async (input) => (calls.push(input), { category: input.text.includes("כסף") ? "refund" : "other", tags: ["a"] });
  const store = new Map();
  const rec = recorded(fn, store, "record");
  assert.deepEqual(await rec({ text: "רוצה את הכסף", lang: "he" }), { category: "refund", tags: ["a"] });
  assert.equal(store.size, 1);
  const key = createHash("sha256").update(JSON.stringify({ lang: "he", text: "רוצה את הכסף" })).digest("hex");
  assert.ok(store.has(key), "המפתח: sha256 של JSON עם מפתחות ממוינים");
  const rep = recorded(async () => assert.fail("replay לא קורא ל־fn"), store, "replay");
  const out = await rep({ lang: "he", text: "רוצה את הכסף" });
  assert.deepEqual(out, { category: "refund", tags: ["a"] });
  out.tags.push("mutated");
  assert.deepEqual((await rep({ text: "רוצה את הכסף", lang: "he" })).tags, ["a"], "replay מחזיר עותק");
  assert.equal(calls.length, 1);
});
test("מקונן — סדר מפתחות לא משנה; מערך — כן", async () => {
  const store = new Map();
  await recorded(async () => 1, store, "record")({ a: { y: 1, x: [{ q: 1, p: 2 }] }, b: 2 });
  const rep = recorded(async () => 0, store, "replay");
  assert.equal(await rep({ b: 2, a: { x: [{ p: 2, q: 1 }], y: 1 } }), 1);
  await assert.rejects(rep({ b: 2, a: { x: [{ p: 2, q: 1 }], y: 2 } }), /אין הקלטה/);
});
test("אין הקלטה ← שגיאה עם תחילת המפתח; שגיאה ב־record לא נשמרת", async () => {
  const store = new Map();
  const key = createHash("sha256").update(JSON.stringify("שאלה")).digest("hex");
  await assert.rejects(recorded(async () => "x", store, "replay")("שאלה"), (e) => e.message.includes("אין הקלטה") && e.message.includes(key.slice(0, 8)));
  await assert.rejects(recorded(async () => { throw new Error("529"); }, store, "record")("שאלה"), /529/);
  assert.equal(store.size, 0);
  let n = 0;
  const rec = recorded(async () => ++n, store, "record");
  await rec("q");
  assert.equal(await rec("q"), 2, "record קורא תמיד, ודורס");
  assert.equal(store.size, 1);
  assert.equal(await recorded(async () => 0, store, "replay")("q"), 2);
});
