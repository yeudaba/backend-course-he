import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E89.ts", ["TestClock"])).TestClock;

test("ברירת מחדל, set ו־now כעותק", async () => {
  const TestClock = await get();
  const c = new TestClock();
  assert.equal(c.now().toISOString(), "2026-11-04T10:00:00.000Z");
  const d = c.now();
  d.setUTCHours(0);
  assert.equal(c.now().toISOString(), "2026-11-04T10:00:00.000Z", "שינוי ב־Date שהוחזר לא משנה את השעון");
  assert.notEqual(c.now(), c.now());
  c.set("2026-12-31T23:59:59Z");
  assert.equal(c.now().toISOString(), "2026-12-31T23:59:59.000Z");
  assert.equal(new TestClock("2026-01-01T00:00:00Z").now().toISOString(), "2026-01-01T00:00:00.000Z");
});
test("advance", async () => {
  const TestClock = await get();
  const c = new TestClock("2026-11-04T10:00:00Z");
  c.advance(1500);
  assert.equal(c.now().toISOString(), "2026-11-04T10:00:01.500Z");
  c.advance("14m59s");
  assert.equal(c.now().toISOString(), "2026-11-04T10:15:00.500Z");
  c.advance("1h30m");
  assert.equal(c.now().toISOString(), "2026-11-04T11:45:00.500Z");
  c.advance("7d");
  assert.equal(c.now().toISOString(), "2026-11-11T11:45:00.500Z");
  c.advance("1d2h3m4s");
  assert.equal(c.now().toISOString(), "2026-11-12T13:48:04.500Z");
  c.advance(-500);
  assert.equal(c.now().toISOString(), "2026-11-12T13:48:04.000Z");
});
test("לא תקין ← RangeError", async () => {
  const TestClock = await get();
  const c = new TestClock();
  for (const bad of ["", "15", "5x", "m", "5x15m", "15m ", "1.5h"]) assert.throws(() => c.advance(bad), RangeError, JSON.stringify(bad));
  assert.equal(c.now().toISOString(), "2026-11-04T10:00:00.000Z", "advance שנכשל לא הזיז");
  assert.throws(() => c.set("not a date"), RangeError);
  assert.throws(() => new TestClock("2026-13-45"), RangeError);
});
