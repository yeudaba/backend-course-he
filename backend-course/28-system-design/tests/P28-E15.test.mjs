import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createBreaker } = await load(import.meta.url, "P28-E15.ts");
function setup(opts = {}) {
  let t = 0;
  let ok = false;
  let calls = 0;
  const b = createBreaker(async () => { calls++; if (!ok) throw new Error("down"); return "ok"; }, { failureThreshold: 3, openMs: 1000, now: () => t, ...opts });
  return { b, set: (o) => (ok = o), tick: (ms) => (t += ms), calls: () => calls };
}

test("closed ← open אחרי failureThreshold כישלונות; ב־open לא קוראים בכלל", async () => {
  const s = setup();
  for (let i = 0; i < 3; i++) await assert.rejects(s.b.exec(), /down/);
  assert.equal(s.b.state, "open");
  await assert.rejects(s.b.exec(), /circuit open/);
  assert.equal(s.calls(), 3, "בזמן open — אין קריאה לשירות");
});
test("הצלחה מאפסת את המונה", async () => {
  const s = setup();
  await assert.rejects(s.b.exec());
  await assert.rejects(s.b.exec());
  s.set(true);
  await s.b.exec();
  s.set(false);
  await assert.rejects(s.b.exec());
  await assert.rejects(s.b.exec());
  assert.equal(s.b.state, "closed");
});
test("אחרי openMs ← half-open: הצלחה סוגרת, כישלון פותח מחדש לעוד openMs", async () => {
  const s = setup();
  for (let i = 0; i < 3; i++) await assert.rejects(s.b.exec());
  s.tick(1000);
  assert.equal(s.b.state, "half-open");
  await assert.rejects(s.b.exec(), /down/);
  assert.equal(s.b.state, "open", "ניסיון אחד נכשל ← open מיד");
  s.tick(999);
  assert.equal(s.b.state, "open", "עוד openMs שלם מהפתיחה החדשה");
  s.tick(1);
  s.set(true);
  assert.equal(await s.b.exec(), "ok");
  assert.equal(s.b.state, "closed");
});
test("half-open: רק בקשת ניסיון אחת בו־זמנית", async () => {
  let t = 0;
  let release;
  let calls = 0;
  let mode = "fail";
  const b = createBreaker(() => { calls++; return mode === "fail" ? Promise.reject(new Error("down")) : new Promise((r) => (release = r)); }, { failureThreshold: 1, openMs: 10, now: () => t });
  await assert.rejects(b.exec());
  t = 10;
  mode = "hang";
  const trial = b.exec();
  await assert.rejects(b.exec(), /circuit open/, "בזמן שהניסיון רץ — השאר נדחים");
  release("ok");
  assert.equal(await trial, "ok");
  assert.equal(calls, 2);
});
