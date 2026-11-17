import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E76.ts", ["uptimeEvents"])).uptimeEvents;
const at = (m) => new Date(Date.UTC(2026, 10, 7, 3, m)).toISOString();
const series = (pattern) => [...pattern].map((c, i) => ({ at: at(i), ok: c === "." }));

test("תקלה אחת", async () => {
  const f = await get();
  assert.deepEqual(f(series("..xxxxx..")), { events: [{ at: at(4), type: "DOWN" }, { at: at(7), type: "UP" }], downMs: 5 * 60_000 });
});
test("כישלונות בודדים — בלי התראה", async () => {
  const f = await get();
  assert.deepEqual(f(series(".x.xx.x..xx.")), { events: [], downMs: 0 });
});
test("כמה תקלות, ותקלה שעוד לא נגמרה", async () => {
  const f = await get();
  const r = f(series("xxx.xxxxx.....xxxx"));
  assert.deepEqual(r.events, [
    { at: at(2), type: "DOWN" }, { at: at(3), type: "UP" },
    { at: at(6), type: "DOWN" }, { at: at(9), type: "UP" },
    { at: at(16), type: "DOWN" },
  ]);
  assert.equal(r.downMs, (3 + 5 + 3) * 60_000, "3 + 5 + (17 - 14)");
});
test("failuresToAlert אחר; ריק", async () => {
  const f = await get();
  assert.deepEqual(f(series(".x."), 1), { events: [{ at: at(1), type: "DOWN" }, { at: at(2), type: "UP" }], downMs: 60_000 });
  assert.deepEqual(f([]), { events: [], downMs: 0 });
});
