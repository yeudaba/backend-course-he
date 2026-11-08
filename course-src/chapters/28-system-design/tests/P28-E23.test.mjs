import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createBreaker } = await load(import.meta.url, "P28-E23.ts");
function setup() {
  let t = 0;
  let ok = false;
  let calls = 0;
  const b = createBreaker(async () => { calls++; if (!ok) throw new Error("down"); return "ok"; }, { failureThreshold: 3, openMs: 1000, now: () => t });
  return { b, set: (o) => (ok = o), tick: (ms) => (t += ms), calls: () => calls };
}

test("הצלחה מאפסת את מונה הכישלונות", async () => {
  const s = setup();
  for (const ok of [false, false, true, false, false]) {
    s.set(ok);
    await s.b.exec().catch(() => {});
  }
  assert.equal(s.b.state, "closed");
});
test("כשפתוח — לא פונים לשירות בכלל", async () => {
  const s = setup();
  for (let i = 0; i < 3; i++) await s.b.exec().catch(() => {});
  assert.equal(s.b.state, "open");
  await assert.rejects(s.b.exec(), /circuit open/);
  assert.equal(s.calls(), 3, "רק 3 הקריאות שנכשלו — לא רביעית");
});
test("כישלון ב־half-open ← open מיד, לעוד openMs שלם", async () => {
  const s = setup();
  for (let i = 0; i < 3; i++) await s.b.exec().catch(() => {});
  s.tick(5000);
  assert.equal(s.b.state, "half-open");
  await s.b.exec().catch(() => {});
  assert.equal(s.b.state, "open");
  s.tick(500);
  assert.equal(s.b.state, "open", "נפתח מחדש עכשיו — עוד לא עברה שנייה");
});
