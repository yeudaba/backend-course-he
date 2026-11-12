import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E81.ts", ["rateLimitHeaders"])).rateLimitHeaders;

test("מותר — בלי Retry-After", async () => {
  const f = await get();
  assert.deepEqual(f({ allowed: true, limit: 10, remaining: 7, resetMs: 42_300 }), { "RateLimit-Limit": "10", "RateLimit-Remaining": "7", "RateLimit-Reset": "43" });
  assert.deepEqual(f({ allowed: true, limit: 5, remaining: 0, resetMs: 60_000 }), { "RateLimit-Limit": "5", "RateLimit-Remaining": "0", "RateLimit-Reset": "60" });
});
test("נדחה — Retry-After בשניות", async () => {
  const f = await get();
  assert.deepEqual(f({ allowed: false, limit: 10, remaining: 0, resetMs: 56_001 }), { "RateLimit-Limit": "10", "RateLimit-Remaining": "0", "RateLimit-Reset": "57", "Retry-After": "57" });
});
test("גבולות: לפחות 1, ולא שלילי", async () => {
  const f = await get();
  assert.equal(f({ allowed: false, limit: 1, remaining: -3, resetMs: 400 })["RateLimit-Remaining"], "0");
  assert.equal(f({ allowed: false, limit: 1, remaining: 0, resetMs: 400 })["Retry-After"], "1", "400ms ← 1, לא 0");
  assert.equal(f({ allowed: true, limit: 1, remaining: 0, resetMs: 0 })["RateLimit-Reset"], "1");
  assert.equal(f({ allowed: true, limit: 1, remaining: 0, resetMs: 1000 })["RateLimit-Reset"], "1");
  assert.equal(f({ allowed: true, limit: 1, remaining: 0, resetMs: 1001 })["RateLimit-Reset"], "2");
});
