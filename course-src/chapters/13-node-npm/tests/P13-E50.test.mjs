import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E50.mjs", ["onShutdown"])).onShutdown;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function fakeProc() {
  const handlers = {};
  return { handlers, exitCode: undefined, on(sig, fn) { handlers[sig] = fn; } };
}

test("רושמת SIGINT ו־SIGTERM, ומחזירה Promise", async () => {
  const onShutdown = await get();
  const proc = fakeProc();
  const p = onShutdown(proc, [], () => {});
  assert.ok(p instanceof Promise, "onShutdown צריכה להחזיר Promise");
  assert.equal(typeof proc.handlers.SIGINT, "function", "חסר handler ל־SIGINT");
  assert.equal(typeof proc.handlers.SIGTERM, "function", "חסר handler ל־SIGTERM");
});
test("ניקוי בסדר הפוך, אחד אחרי השני, ואז exitCode 0", async () => {
  const onShutdown = await get();
  const proc = fakeProc();
  const log = [];
  const order = [];
  const step = (name, ms) => async () => { order.push(`start ${name}`); await sleep(ms); order.push(`end ${name}`); };
  const done = onShutdown(proc, [step("db", 5), step("server", 15)], (m) => log.push(m));
  proc.handlers.SIGTERM();
  await done;
  assert.deepEqual(order, ["start server", "end server", "start db", "end db"], "בסדר הפוך, ורק אחרי שהקודם הסתיים");
  assert.equal(proc.exitCode, 0);
  assert.deepEqual(log, ["התקבל SIGTERM, סוגר...", "סיום"]);
});
test("ניקוי שנכשל — ממשיכים, ו־exitCode 1", async () => {
  const onShutdown = await get();
  const proc = fakeProc();
  const log = [];
  const ran = [];
  const done = onShutdown(proc, [async () => ran.push("a"), async () => { throw new Error("כבר סגור"); }, async () => ran.push("c")], (m) => log.push(m));
  proc.handlers.SIGINT();
  await done;
  assert.deepEqual(ran, ["c", "a"], "אחרי כישלון ממשיכים לבאים");
  assert.equal(proc.exitCode, 1);
  assert.deepEqual(log, ["התקבל SIGINT, סוגר...", "ניקוי נכשל: כבר סגור", "סיום"]);
});
test("אות שני — מתעלמים", async () => {
  const onShutdown = await get();
  const proc = fakeProc();
  let calls = 0;
  const log = [];
  const done = onShutdown(proc, [async () => { calls++; await sleep(10); }], (m) => log.push(m));
  proc.handlers.SIGTERM();
  proc.handlers.SIGINT();
  proc.handlers.SIGTERM();
  await done;
  await sleep(15);
  assert.equal(calls, 1, "הניקוי רץ פעם אחת בלבד");
  assert.deepEqual(log, ["התקבל SIGTERM, סוגר...", "סיום"]);
});
