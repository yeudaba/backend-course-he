import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { delegateAll } = await load(import.meta.url, "P29.5-E84.ts");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test("מגבלת מקביליות, סדר, חיתוך", async () => {
  let active = 0;
  let peak = 0;
  const task = (name, ms, text = name) => ({ worker: name, run: async () => { active++; peak = Math.max(peak, active); await wait(ms); active--; return text; } });
  const t0 = Date.now();
  const r = await delegateAll([task("a", 60), task("b", 20), task("c", 20, "x".repeat(2500)), task("d", 20), task("e", 20)], { concurrency: 2, timeoutMs: 1000 });
  const ms = Date.now() - t0;
  assert.equal(peak, 2);
  assert.ok(ms < 140, `בלי לחכות לקבוצות (${ms}ms)`);
  assert.deepEqual(r.map((x) => [x.worker, x.ok, x.text.length]), [["a", true, 1], ["b", true, 1], ["c", true, 2000], ["d", true, 1], ["e", true, 1]]);
  assert.deepEqual(await delegateAll([], { concurrency: 3, timeoutMs: 10 }), []);
});
test("שגיאה ו־timeout — המקום מתפנה, וה־signal מבוטל", async () => {
  const signals = {};
  const slow = { worker: "slow", run: (s) => { signals.slow = s; return new Promise((res) => setTimeout(() => res("late"), 500)); } };
  const boom = { worker: "boom", run: async () => { throw new Error("no access"); } };
  const ok = { worker: "ok", run: async (s) => { signals.ok = s; await wait(10); return "fine"; } };
  const t0 = Date.now();
  const r = await delegateAll([slow, boom, ok], { concurrency: 1, timeoutMs: 60 });
  const ms = Date.now() - t0;
  assert.ok(ms < 250, `לא מחכים לאיטי (${ms}ms)`);
  assert.deepEqual(r, [{ worker: "slow", ok: false, text: "timeout" }, { worker: "boom", ok: false, text: "error: no access" }, { worker: "ok", ok: true, text: "fine" }]);
  assert.equal(signals.slow.aborted, true);
  assert.equal(signals.ok.aborted, false);
});
