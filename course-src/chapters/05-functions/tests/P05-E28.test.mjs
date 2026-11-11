import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P05-E28.js", ["isPrime"]);

test("ראשוניים", async () => {
  const { isPrime } = await get();
  for (const n of [2, 3, 5, 17, 97, 7919]) assert.equal(isPrime(n), true, `${n} ראשוני`);
});
test("לא ראשוניים", async () => {
  const { isPrime } = await get();
  for (const n of [4, 9, 15, 25, 91, 7917]) assert.equal(isPrime(n), false, `${n} אינו ראשוני`);
});
test("מקרי קצה: 1, 0, שליליים ושברים", async () => {
  const { isPrime } = await get();
  for (const n of [1, 0, -7, 2.5, NaN]) assert.equal(isPrime(n), false, `isPrime(${n}) צריכה להיות false`);
});
test("מספר גדול — עונה מהר", async () => {
  const { isPrime } = await get();
  const t = Date.now();
  assert.equal(isPrime(1000000007), true, "1,000,000,007 ראשוני");
  assert.ok(Date.now() - t < 1000, "לקח יותר משנייה. רמז 2: מספיק לבדוק מחלקים עד השורש (d * d <= n)");
});
test("לולאה", () => {
  assert.match(code(import.meta.url, "P05-E28.js"), /\bfor\s*\(|\bwhile\s*\(/, "התרגיל מתרגל לולאות (פרק 4)");
});
