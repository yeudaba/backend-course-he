import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E80.ts", ["createFixedWindow"])).createFixedWindow;

test("מגבלה, remaining ו־resetSeconds", async () => {
  let t = 120_000 + 15_500; // 15.5 שניות לתוך דקה
  const fw = (await get())({ limit: 3, windowMs: 60_000, now: () => t });
  assert.deepEqual(fw.hit("a"), { allowed: true, remaining: 2, resetSeconds: 45 });
  assert.deepEqual(fw.hit("a"), { allowed: true, remaining: 1, resetSeconds: 45 });
  assert.deepEqual(fw.hit("a"), { allowed: true, remaining: 0, resetSeconds: 45 });
  assert.deepEqual(fw.hit("a"), { allowed: false, remaining: 0, resetSeconds: 45 });
  assert.deepEqual(fw.hit("b"), { allowed: true, remaining: 2, resetSeconds: 45 }, "מפתח אחר — מונה משלו");
  t = 179_999;
  assert.deepEqual(fw.hit("a"), { allowed: false, remaining: 0, resetSeconds: 1 });
  t = 180_000;
  assert.deepEqual(fw.hit("a"), { allowed: true, remaining: 2, resetSeconds: 60 }, "חלון חדש");
});
test("פרץ בגבול — החולשה של fixed window", async () => {
  let t = 59_000;
  const fw = (await get())({ limit: 2, windowMs: 60_000, now: () => t });
  assert.equal(fw.hit("x").allowed && fw.hit("x").allowed, true);
  t = 60_000;
  assert.equal(fw.hit("x").allowed && fw.hit("x").allowed, true, "4 בקשות בשנייה אחת עוברות");
});
test("נדחות לא נספרות", async () => {
  let t = 0;
  const fw = (await get())({ limit: 1, windowMs: 1000, now: () => t });
  fw.hit("k");
  for (let i = 0; i < 5; i++) assert.equal(fw.hit("k").allowed, false);
  t = 1000;
  assert.equal(fw.hit("k").allowed, true);
});
test("size ו־sweep", async () => {
  let t = 0;
  const fw = (await get())({ limit: 5, windowMs: 1000, now: () => t });
  fw.hit("a");
  fw.hit("b");
  assert.equal(fw.size(), 2);
  assert.equal(fw.sweep(), 0, "החלון עוד פתוח");
  t = 1500;
  fw.hit("c");
  assert.equal(fw.sweep(), 2);
  assert.equal(fw.size(), 1);
});
