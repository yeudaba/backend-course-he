import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { DataModule, RATE_LIMIT, CLOCK } = loadNest(import.meta.url, "P20-E25.ts");

test("חלון קבוע: 3 בקשות ל־10 שניות", async (t) => {
  let now = new Date("2026-11-04T10:00:00.000Z");
  const { call } = await nestApp(t, DataModule, { overrides: [[RATE_LIMIT, { limit: 3, windowMs: 10_000 }], [CLOCK, { now: () => now }]] });
  const as = (id) => ({ headers: { "x-client-id": id } });
  const remaining = [];
  for (let i = 0; i < 3; i++) {
    const res = await call("GET", "/data", undefined, as("a"));
    assert.equal(res.status, 200);
    remaining.push(res.headers.get("x-ratelimit-remaining"));
  }
  assert.deepEqual(remaining, ["2", "1", "0"]);

  now = new Date("2026-11-04T10:00:02.500Z");
  let res = await call("GET", "/data", undefined, as("a"));
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("retry-after"), "8", "נשארו 7.5 שניות ← מעגלים למעלה");
  assert.equal(res.body.error.code, "RATE_LIMITED");

  assert.equal((await call("GET", "/data", undefined, as("b"))).status, 200, "לקוח אחר — מונה משלו");

  now = new Date("2026-11-04T10:00:10.000Z");
  res = await call("GET", "/data", undefined, as("a"));
  assert.equal(res.status, 200, "חלון חדש");
  assert.equal(res.headers.get("x-ratelimit-remaining"), "2");
});
test("ברירות המחדל של המודול: 5 בקשות", async (t) => {
  const { call } = await nestApp(t, DataModule);
  for (let i = 0; i < 5; i++) assert.equal((await call("GET", "/data")).status, 200);
  const res = await call("GET", "/data");
  assert.equal(res.status, 429);
  assert.ok(Number(res.headers.get("retry-after")) > 0);
});
