import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { replay, replayAll, InvalidEvent } = await load(import.meta.url, "P30-E25.ts");
const t = (h) => `2026-11-08T${String(h).padStart(2, "0")}:00:00Z`;
const created = (id = 1, total = 18900) => ({ orderId: id, type: "created", at: t(9), totalCents: total });

test("משחזר מצב והיסטוריה", () => {
  const s = replay([created(), { orderId: 1, type: "paid", at: t(10), amountCents: 18900 }, { orderId: 1, type: "shipped", at: t(12) }]);
  assert.equal(s.status, "shipped");
  assert.equal(s.paidCents, 18900);
  assert.deepEqual(s.history.map((h) => h.status), ["pending_payment", "paid", "shipped"]);
});
test("ביטול אחרי תשלום, והחזר — עד הסכום ששולם", () => {
  const base = [created(), { orderId: 1, type: "paid", at: t(10), amountCents: 18900 }, { orderId: 1, type: "cancelled", at: t(11) }];
  const s = replay([...base, { orderId: 1, type: "refunded", at: t(12), amountCents: 18900 }]);
  assert.deepEqual([s.status, s.refundedCents], ["cancelled", 18900]);
  assert.throws(() => replay([...base, { orderId: 1, type: "refunded", at: t(12), amountCents: 20000 }]), (e) => e instanceof InvalidEvent && e.index === 3);
});
test("מעברים לא חוקיים — עם האינדקס", () => {
  const cases = [
    [[{ orderId: 1, type: "paid", at: t(9), amountCents: 1 }], 0],
    [[created(), { orderId: 1, type: "shipped", at: t(10) }], 1],
    [[created(), { orderId: 1, type: "paid", at: t(10), amountCents: 100 }], 1],
    [[created(), { orderId: 1, type: "cancelled", at: t(10) }, { orderId: 1, type: "paid", at: t(11), amountCents: 18900 }], 2],
    [[created(), { orderId: 1, type: "paid", at: t(8), amountCents: 18900 }], 1],
    [[created(), { orderId: 2, type: "paid", at: t(10), amountCents: 18900 }], 1],
    [[created(), { orderId: 1, type: "refunded", at: t(10), amountCents: 1 }], 1],
  ];
  for (const [events, index] of cases) assert.throws(() => replay(events), (e) => e instanceof InvalidEvent && e.index === index, JSON.stringify(events.at(-1)));
  assert.throws(() => replay([]), InvalidEvent);
});
test("replayAll — הזמנה שבורה לא מפילה את השאר", () => {
  const r = replayAll([created(2), created(1), { orderId: 2, type: "shipped", at: t(10) }, { orderId: 1, type: "paid", at: t(10), amountCents: 18900 }]);
  assert.deepEqual(r.orders.map((o) => [o.orderId, o.status]), [[1, "paid"]]);
  assert.deepEqual(r.errors.map((e) => e.orderId), [2]);
  assert.match(r.errors[0].message, /shipped/);
});
