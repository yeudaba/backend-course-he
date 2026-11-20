import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E39.js", ["measureLateness"]);

// טיימר "ביקורת" של הבודק, שמתחיל יחד עם שלך: כמה המחשב הזה מאחר בעצמו (במחשב עמוס — יותר)
function run(fn, requested, blockMs) {
  return new Promise((resolve) => {
    const start = Date.now();
    const got = [];
    got.control = 0;
    setTimeout(() => {
      got.control = Math.max(0, Date.now() - start - requested);
    }, requested);
    fn(requested, blockMs, (late) => {
      got.push(late);
      setTimeout(() => resolve(got), 20);
    });
    got.blocked = Date.now() - start;
    setTimeout(() => resolve(got), 400);
  });
}

test("עם חסימה ארוכה — האיחור קרוב לחסימה פחות הזמן שביקשו", async () => {
  const { measureLateness } = await get();
  const got = await run(measureLateness, 10, 60);
  assert.ok(got.blocked >= 60, `measureLateness חזרה אחרי ${got.blocked}ms — היא צריכה לחסום blockMs מילישניות`);
  assert.equal(got.length, 1, `report נקראה ${got.length} פעמים`);
  assert.equal(typeof got[0], "number");
  // הגבול העליון יחסי לחסימה שנמדדה בפועל (במחשב איטי היא ארוכה יותר)
  assert.ok(got[0] >= 45 && got[0] <= got.blocked - 10 + 25, `האיחור ${got[0]}ms — ציפינו לבערך ${got.blocked - 10} (${got.blocked}ms של חסימה פחות 10 שביקשו)`);
});
test("בלי חסימה — כמעט בזמן, ולא שלילי", async () => {
  const { measureLateness } = await get();
  const got = await run(measureLateness, 30, 0);
  assert.equal(got.length, 1);
  assert.ok(got[0] >= 0 && got[0] < got.control + 20, `האיחור ${got[0]}ms (טיימר הביקורת של הבודק איחר ${got.control}ms) — בלי חסימה צריך להיות קרוב ל־0`);
});
test("חסימה קצרה מהטיימר — לא מאחרת", async () => {
  const { measureLateness } = await get();
  const got = await run(measureLateness, 50, 20);
  assert.ok(got[0] >= 0 && got[0] < got.control + 20, `האיחור ${got[0]}ms (טיימר הביקורת של הבודק איחר ${got.control}ms) — החסימה (20ms) נגמרה לפני שהטיימר (50ms) הבשיל`);
});
