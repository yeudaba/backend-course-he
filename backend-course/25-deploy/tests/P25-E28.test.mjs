import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P25-E28.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["mapLimit"])).mapLimit;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("תוצאות בסדר של הקלט, ולכל היותר limit במקביל", async () => {
  const mapLimit = await get();
  let running = 0;
  let peak = 0;
  const delays = [80, 10, 50, 10, 30, 10, 60];
  const started = Date.now();
  const out = await mapLimit(delays, 3, async (ms, i) => {
    running++;
    peak = Math.max(peak, running);
    await sleep(ms);
    running--;
    return `${i}:${ms}`;
  });
  const took = Date.now() - started;
  assert.deepEqual(out, delays.map((ms, i) => `${i}:${ms}`), "התוצאה במקום של הפריט, גם אם הוא הסתיים מאוחר");
  assert.equal(peak, 3, "בדיוק limit עבודות רצות במקביל (לא יותר, ולא אחת־אחת)");
  assert.ok(took < 200, `לקח ${took}ms — נראה שהעבודות רצות אחת אחרי השנייה (סכום ההשהיות 250ms)`);
});
test("limit גדול מהרשימה, ורשימה ריקה", async () => {
  const mapLimit = await get();
  assert.deepEqual(await mapLimit([1, 2], 10, async (n) => n * 2), [2, 4]);
  assert.deepEqual(await mapLimit([], 2, async (n) => n), []);
});
test("שגיאה ← reject, ולא מתחילים עבודות חדשות", async () => {
  const mapLimit = await get();
  const started = [];
  await assert.rejects(
    mapLimit([1, 2, 3, 4, 5, 6], 2, async (n) => {
      started.push(n);
      await sleep(10);
      if (n === 2) throw new Error("boom");
      return n;
    }),
    /boom/,
  );
  await sleep(50);
  assert.ok(started.length <= 3, `אחרי שהעבודה השנייה נכשלה עדיין התחילו עבודות: ${started.join(", ")}`);
});
test("limit לא תקין ← RangeError", async () => {
  const mapLimit = await get();
  for (const bad of [0, -1, 1.5]) await assert.rejects(async () => mapLimit([1], bad, async (n) => n), RangeError, String(bad));
});
