import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { decodeMessage } = await load(import.meta.url, "P26.5-E89.ts");
const msg = (type, value, key) => ({ key, value: typeof value === "string" ? value : JSON.stringify(value), headers: type ? { "event-type": type } : {} });

test("תקין — גם עם שדות נוספים", () => {
  const e = { orderId: 42, email: "dana@example.com", totalCents: 8990, coupon: "NEW" };
  assert.deepEqual(decodeMessage(msg("order.placed", e, "42")), { ok: true, type: "order.placed", event: e });
  assert.deepEqual(decodeMessage(msg("order.paid", { orderId: 7, amountCents: 100 }, "7")), { ok: true, type: "order.paid", event: { orderId: 7, amountCents: 100 } });
  assert.equal(decodeMessage(msg("order.shipped", { orderId: 7, carrier: "UPS" }, "7")).ok, true);
});
test("כל סיבה", () => {
  const r = (m) => decodeMessage(m).reason;
  assert.equal(r(msg(null, { orderId: 1 }, "1")), "missing-type");
  assert.equal(r(msg("order.refunded", { orderId: 1 }, "1")), "unknown-type");
  assert.equal(r(msg("order.paid", "{oops", "1")), "bad-json");
  assert.equal(r(msg("order.paid", { orderId: 1 }, "1")), "invalid");
  assert.equal(r(msg("order.placed", { orderId: 1, email: "x", totalCents: 5 }, "1")), "invalid");
  assert.equal(r(msg("order.shipped", { orderId: 1, carrier: "" }, "1")), "invalid");
  assert.equal(r(msg("order.paid", { orderId: 7, amountCents: 1 }, "8")), "wrong-key");
  assert.equal(r(msg("order.paid", { orderId: 7, amountCents: 1 }, null)), "wrong-key");
});
