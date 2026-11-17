import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { waitForSync } = await load(import.meta.url, "P26.3-E84.ts");
function fakeClock() {
  const c = { t: 1000, sleeps: [] };
  c.now = () => c.t;
  c.sleep = async (ms) => { c.sleeps.push(ms); c.t += ms; };
  return c;
}
function seq(list) {
  let i = 0;
  return async () => { const x = list[Math.min(i++, list.length - 1)]; if (x instanceof Error) throw x; return x; };
}

test("מחכה עד Synced+Healthy, גם דרך שגיאות רשת", async () => {
  const c = fakeClock();
  const s = await waitForSync(seq([{ sync: "OutOfSync", health: "Healthy" }, new Error("ECONNRESET"), { sync: "Synced", health: "Progressing" }, { sync: "Synced", health: "Healthy" }]), { timeoutMs: 60_000, intervalMs: 5000, sleep: c.sleep, now: c.now });
  assert.deepEqual(s, { sync: "Synced", health: "Healthy" });
  assert.deepEqual(c.sleeps, [5000, 5000, 5000]);
});
test("Degraded ← מיד; timeout", async () => {
  const c = fakeClock();
  await assert.rejects(waitForSync(seq([{ sync: "Synced", health: "Progressing" }, { sync: "Synced", health: "Degraded" }]), { timeoutMs: 60_000, intervalMs: 1000, sleep: c.sleep, now: c.now }), { message: "DEGRADED" });
  assert.deepEqual(c.sleeps, [1000]);
  const d = fakeClock();
  await assert.rejects(waitForSync(seq([{ sync: "OutOfSync", health: "Healthy" }]), { timeoutMs: 10_000, intervalMs: 3000, sleep: d.sleep, now: d.now }), { message: "TIMEOUT" });
  assert.equal(d.sleeps.length, 4, "3000×4 = 12000 ≥ 10000");
  const e = fakeClock();
  assert.deepEqual(await waitForSync(seq([{ sync: "Synced", health: "Healthy" }]), { timeoutMs: 0, intervalMs: 1, sleep: e.sleep, now: e.now }), { sync: "Synced", health: "Healthy" }, "בודקים לפחות פעם אחת");
});
test("ברירות מחדל אמיתיות", async () => {
  const start = Date.now();
  await assert.rejects(waitForSync(async () => ({ sync: "OutOfSync", health: "Healthy" }), { timeoutMs: 60, intervalMs: 20 }), { message: "TIMEOUT" });
  assert.ok(Date.now() - start < 1000);
});
