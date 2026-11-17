import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P18-E52.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["createMutex"])).createMutex;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("אחת־אחת, לפי הסדר, עם התוצאות", async () => {
  const createMutex = await get();
  const lock = createMutex();
  const log = [];
  let running = 0;
  let maxRunning = 0;
  const job = (name, ms) => lock.run(async () => {
    running++;
    maxRunning = Math.max(maxRunning, running);
    log.push(`start ${name}`);
    await sleep(ms);
    log.push(`end ${name}`);
    running--;
    return name.toUpperCase();
  });
  const results = await Promise.all([job("a", 30), job("b", 5), job("c", 15)]);
  assert.deepEqual(results, ["A", "B", "C"]);
  assert.deepEqual(log, ["start a", "end a", "start b", "end b", "start c", "end c"], "כל משימה מתחילה רק אחרי שהקודמת הסתיימה");
  assert.equal(maxRunning, 1);
});
test("שגיאה לא עוצרת את התור, ו־pending", async () => {
  const createMutex = await get();
  const lock = createMutex();
  assert.equal(lock.pending(), 0);
  const p1 = lock.run(async () => { await sleep(10); throw new Error("boom"); });
  const p2 = lock.run(async () => 2);
  const p3 = lock.run(async () => { await sleep(5); return 3; });
  assert.equal(lock.pending(), 3);
  await assert.rejects(p1, { message: "boom" });
  assert.equal(await p2, 2);
  assert.equal(await p3, 3);
  await sleep(0);
  assert.equal(lock.pending(), 0);
});
test("מתקן מרוץ בזיכרון", async () => {
  const createMutex = await get();
  const lock = createMutex();
  let stock = 1;
  const buy = () => lock.run(async () => {
    const seen = stock;
    await sleep(5);
    if (seen < 1) throw new Error("OUT_OF_STOCK");
    stock = seen - 1;
    return "ok";
  });
  const results = await Promise.allSettled(Array.from({ length: 5 }, buy));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(stock, 0);
  const free = createMutex();
  assert.notEqual(free, lock, "כל createMutex — תור נפרד");
  const order = [];
  await Promise.all([lock.run(async () => { await sleep(20); order.push("lock"); }), free.run(async () => { order.push("free"); })]);
  assert.deepEqual(order, ["free", "lock"], "שני mutex־ים לא מחכים זה לזה");
});
