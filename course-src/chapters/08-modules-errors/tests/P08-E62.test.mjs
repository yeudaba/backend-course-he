import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E62.js";
const get = () => exportsOf(import.meta.url, FILE, ["ownFrames"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const stack = `TypeError: x
    at lineTotal (/home/dana/shop/src/lines.js:2:15)
    at Array.reduce (<anonymous>)
    at /home/dana/shop/src/orders.js:4:50
    at handle (/home/dana/shop/node_modules/express/lib/router.js:120:7)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)`;
test("רק השורות של הפרויקט", async () => {
  const { ownFrames } = await get();
  assert.deepEqual(ownFrames(stack, "/home/dana/shop"), ["src/lines.js:2", "src/orders.js:4"]);
});
test("תיקייה אחרת", async () => {
  const { ownFrames } = await get();
  assert.deepEqual(ownFrames(stack, "/home/dana"), ["shop/src/lines.js:2", "shop/src/orders.js:4"]);
  assert.deepEqual(ownFrames(stack, "/home/omer"), []);
});
test("תיקייה עם שם דומה לא נחשבת", async () => {
  const { ownFrames } = await get();
  const s = "Error: y\n    at f (/home/dana/shop-old/a.js:9:1)\n    at g (/home/dana/shop/b.js:3:2)";
  assert.deepEqual(ownFrames(s, "/home/dana/shop"), ["b.js:3"]);
});
test("stack אמיתי מהבודק עצמו", async () => {
  const { ownFrames } = await get();
  const err = new Error("בדיקה");
  // ב־ES Modules הנתיבים ב־stack הם כתובות file:///...
  const dir = new URL(".", import.meta.url).href.replace(/\/$/, "");
  const frames = ownFrames(err.stack, dir);
  assert.ok(frames.length >= 1 && frames[0].startsWith("P08-E62.test.mjs:"), `ציפינו לשורה מהקובץ P08-E62.test.mjs, וקיבלנו ${JSON.stringify(frames)}`);
});
