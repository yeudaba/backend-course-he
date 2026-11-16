import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createSemaphore } = await load(import.meta.url, "P28.5-E49.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("לכל היותר max, ובסדר FIFO", async () => {
  const s = createSemaphore(2);
  let now = 0, peak = 0;
  const order = [];
  const job = (id, ms) => s.run(async () => {
    now++; peak = Math.max(peak, now); order.push(id);
    await sleep(ms);
    now--;
    return id;
  });
  const p = [job(1, 40), job(2, 10), job(3, 10), job(4, 10), job(5, 10)];
  await sleep(1);
  assert.equal(s.active(), 2);
  assert.equal(s.waiting(), 3);
  assert.deepEqual(await Promise.all(p), [1, 2, 3, 4, 5]);
  assert.equal(peak, 2);
  assert.deepEqual(order, [1, 2, 3, 4, 5]);
  assert.equal(s.active(), 0);
});
test("שגיאה משחררת מקום", async () => {
  const s = createSemaphore(1);
  await assert.rejects(s.run(async () => { throw new Error("x"); }), /x/);
  await assert.rejects(s.run(async () => { throw new Error("y"); }), /y/);
  assert.equal(await s.run(async () => 7), 7);
});
test("תור מלא ← busy", async () => {
  const s = createSemaphore(1, 1);
  const a = s.run(() => sleep(30));
  const b = s.run(() => sleep(1));
  await assert.rejects(s.run(async () => 1), /busy/);
  await Promise.all([a, b]);
  assert.equal(await s.run(async () => "ok"), "ok");
});
test("max לא תקין", () => {
  assert.throws(() => createSemaphore(0), RangeError);
  assert.throws(() => createSemaphore(1.5), RangeError);
});
