import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P28-E28.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["hedged"])).hedged;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הראשונה מהירה — בקשה אחת בלבד", async () => {
  const hedged = await get();
  const calls = [];
  const v = await hedged(async (attempt) => {
    calls.push(attempt);
    await sleep(10);
    return `r${attempt}`;
  }, 60);
  assert.equal(v, "r1");
  await sleep(100);
  assert.deepEqual(calls, [1], "הראשונה ענתה לפני delayMs — לא שולחים שנייה");
});
test("הראשונה איטית — השנייה יוצאת אחרי delayMs, והמהירה מנצחת", async () => {
  const hedged = await get();
  const calls = [];
  const t0 = Date.now();
  const v = await hedged(async (attempt) => {
    calls.push([attempt, Date.now() - t0]);
    await sleep(attempt === 1 ? 400 : 20);
    return `r${attempt}`;
  }, 50);
  const took = Date.now() - t0;
  assert.equal(v, "r2");
  assert.ok(took < 250, `לקח ${took}ms — היה צריך לחזור עם השנייה (~70ms), בלי לחכות לראשונה`);
  assert.equal(calls.length, 2);
  assert.ok(calls[1][1] >= 45, `השנייה התחילה אחרי ${calls[1][1]}ms — רק אחרי delayMs`);
});
test("הראשונה נכשלה מהר — השנייה יוצאת מיד, בלי לחכות ל־delayMs", async () => {
  const hedged = await get();
  const t0 = Date.now();
  const v = await hedged(async (attempt) => {
    if (attempt === 1) throw new Error("ECONNRESET");
    return "r2";
  }, 300);
  assert.equal(v, "r2", "כישלון של אחת הוא לא כישלון של הכול");
  assert.ok(Date.now() - t0 < 150, "אחרי כישלון אין סיבה לחכות 300ms");
});
test("שתיהן נכשלו ← reject עם השגיאה האחרונה; לכל היותר שתי בקשות", async () => {
  const hedged = await get();
  let calls = 0;
  await assert.rejects(
    hedged(async (attempt) => {
      calls++;
      await sleep(attempt === 1 ? 80 : 10);
      throw new Error(`fail ${attempt}`);
    }, 30),
    /fail 1/,
    "השנייה נכשלה ב־~40ms, הראשונה ב־80ms — האחרונה היא fail 1",
  );
  await sleep(150);
  assert.equal(calls, 2);
});
test("תשובה אחרי שכבר הוחלט — לא משנה כלום", async () => {
  const hedged = await get();
  const v = await hedged(async (attempt) => {
    if (attempt === 1) {
      await sleep(100);
      throw new Error("late failure");
    }
    await sleep(10);
    return "r2";
  }, 20);
  assert.equal(v, "r2");
  await sleep(150); // אם הכישלון המאוחר היה מטופל לא נכון — unhandled rejection היה מפיל את הבדיקה
});
