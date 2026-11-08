import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { makeEvent, parseOrderPlaced } = await load(import.meta.url, "P26.5-E08.ts");
const now = new Date("2026-11-08T10:00:00Z");

test("makeEvent: מעטפת מלאה", () => {
  const e = makeEvent("order.placed", 2, { orderId: 1 }, { id: "e-1", now });
  assert.deepEqual(e, { id: "e-1", type: "order.placed", version: 2, occurredAt: "2026-11-08T10:00:00.000Z", source: "coffee-api", data: { orderId: 1 } });
  const a = makeEvent("x", 1, {});
  const b = makeEvent("x", 1, {});
  assert.match(a.id, /^[0-9a-f-]{36}$/);
  assert.notEqual(a.id, b.id, "id ייחודי — לפיו מזהים כפילויות");
});
test("v2 עובר כמו שהוא", () => {
  const data = { orderId: 5, email: "dana@example.com", total: { amountCents: 8990, currency: "ILS" } };
  const e = parseOrderPlaced(JSON.stringify(makeEvent("order.placed", 2, data, { id: "a", now })));
  assert.deepEqual(e.data, data);
  assert.equal(e.version, 2);
});
test("v1 (מ־producer ישן) ← מומר לצורה של v2", () => {
  const raw = JSON.stringify(makeEvent("order.placed", 1, { orderId: 5, email: "dana@example.com", totalCents: 8990 }, { id: "a", now }));
  const e = parseOrderPlaced(raw);
  assert.equal(e.version, 2);
  assert.deepEqual(e.data, { orderId: 5, email: "dana@example.com", total: { amountCents: 8990, currency: "ILS" } });
  assert.equal(e.id, "a");
});
test("שדות נוספים שלא מכירים — לא שוברים (תאימות קדימה)", () => {
  const data = { orderId: 5, email: "d@example.com", total: { amountCents: 1, currency: "USD" }, coupon: "X" };
  assert.doesNotThrow(() => parseOrderPlaced(JSON.stringify({ ...makeEvent("order.placed", 2, data, { now }), traceId: "t" })));
});
test("פגום ← שגיאה", () => {
  const ok = makeEvent("order.placed", 2, { orderId: 5, email: "d@example.com", total: { amountCents: 1, currency: "ILS" } }, { now });
  const bad = [
    "{not json",
    JSON.stringify({ ...ok, type: "order.paid" }),
    JSON.stringify({ ...ok, version: 3 }),
    JSON.stringify({ ...ok, occurredAt: "yesterday" }),
    JSON.stringify({ ...ok, id: undefined }),
    JSON.stringify({ ...ok, data: { ...ok.data, email: "not-an-email" } }),
    JSON.stringify({ ...ok, data: { ...ok.data, total: { amountCents: -1, currency: "ILS" } } }),
    JSON.stringify(makeEvent("order.placed", 1, { orderId: 5, email: "d@example.com" }, { now })),
  ];
  for (const raw of bad) assert.throws(() => parseOrderPlaced(raw), undefined, raw.slice(0, 80));
});
