import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createHLL, add, count, mergeHLL } = await load(import.meta.url, "P28.5-E18.ts");
const err = (est, real) => Math.abs(est - real) / real;

test("100,000 משתמשים שונים מתוך 300,000 צפיות — בטעות של עד 3%", () => {
  const h = createHLL(12);
  for (let i = 0; i < 300_000; i++) add(h, `user-${i % 100_000}`);
  const c = count(h);
  assert.ok(err(c, 100_000) < 0.03, `הערכה ${c}`);
  assert.equal(h.registers.length, 4096, "4096 רגיסטרים של בית — 4KB, לא 100,000 מחרוזות");
});
test("מעט ערכים ← כמעט מדויק", () => {
  const h = createHLL(12);
  for (let i = 0; i < 1000; i++) add(h, i);
  assert.ok(err(count(h), 1000) < 0.03, `הערכה ${count(h)}`);
  assert.equal(count(createHLL()), 0);
});
test("merge: איחוד בלי כפילויות בין שרתים", () => {
  const a = createHLL();
  const b = createHLL();
  for (let i = 0; i < 60_000; i++) add(a, `u${i}`);
  for (let i = 40_000; i < 100_000; i++) add(b, `u${i}`);
  const m = mergeHLL(a, b);
  assert.ok(err(count(m), 100_000) < 0.03, `${count(m)}`);
  assert.throws(() => mergeHLL(createHLL(10), createHLL(12)));
});
