import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E64.js";
const get = () => exportsOf(import.meta.url, FILE, ["findFirst"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("נמצא", async () => {
  const { findFirst } = await get();
  assert.equal(findFirst(1000, 2000, (n) => n % 7 === 0 && n % 13 === 0), 1001);
  assert.equal(findFirst(1, 10, (n) => n * n > 30), 6);
});
test("לא נמצא ← null", async () => {
  const { findFirst } = await get();
  assert.equal(findFirst(1, 10, (n) => n > 20), null);
  assert.equal(findFirst(5, 4, () => true), null);
});
test("עוצרת ברגע שמצאה", async () => {
  const { findFirst } = await get();
  let calls = 0;
  findFirst(1, 1000, (n) => {
    calls++;
    return n === 3;
  });
  assert.equal(calls, 3, `ה־predicate נקרא ${calls} פעמים — אחרי שמצאת, החזר מיד`);
});
