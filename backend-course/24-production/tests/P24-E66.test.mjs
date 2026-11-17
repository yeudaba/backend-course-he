import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E66.ts", ["decide", "shouldStore"]);
const TTL = 1000;

test("execute — אין רשומה או שפג תוקפה", async () => {
  const { decide } = await get();
  assert.deepEqual(decide(undefined, "fp", 5000, TTL), { action: "execute" });
  assert.deepEqual(decide({ fingerprint: "other", status: null, createdAt: 4000 }, "fp", 5000, TTL), { action: "execute" }, "בדיוק ttlMs ← פג");
  assert.deepEqual(decide({ fingerprint: "fp", status: 201, body: { id: 1 }, createdAt: 0 }, "fp", 5000, TTL), { action: "execute" });
});
test("reject — טביעה אחרת קודמת ל'בטיפול'", async () => {
  const { decide } = await get();
  assert.deepEqual(decide({ fingerprint: "other", status: 201, body: {}, createdAt: 4500 }, "fp", 5000, TTL), { action: "reject", status: 422, code: "IDEMPOTENCY_KEY_REUSED" });
  assert.deepEqual(decide({ fingerprint: "other", status: null, createdAt: 4500 }, "fp", 5000, TTL), { action: "reject", status: 422, code: "IDEMPOTENCY_KEY_REUSED" });
  assert.deepEqual(decide({ fingerprint: "fp", status: null, createdAt: 4001 }, "fp", 5000, TTL), { action: "reject", status: 409, code: "IDEMPOTENCY_IN_PROGRESS" });
});
test("replay", async () => {
  const { decide } = await get();
  const body = { id: 7, title: "x" };
  assert.deepEqual(decide({ fingerprint: "fp", status: 201, body, createdAt: 4999 }, "fp", 5000, TTL), { action: "replay", status: 201, body });
  assert.deepEqual(decide({ fingerprint: "fp", status: 422, body: { error: "x" }, createdAt: 4999 }, "fp", 5000, TTL), { action: "replay", status: 422, body: { error: "x" } });
});
test("shouldStore", async () => {
  const { shouldStore } = await get();
  for (const s of [200, 201, 204, 400, 404, 409, 422, 499]) assert.equal(shouldStore(s), true, String(s));
  for (const s of [500, 502, 503, 504]) assert.equal(shouldStore(s), false, String(s));
});
