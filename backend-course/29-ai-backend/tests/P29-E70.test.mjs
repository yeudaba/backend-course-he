import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createRefundActions } = await load(import.meta.url, "P29-E70.ts");

function setup() {
  const orders = new Map([[3, { id: 3, userId: 1, totalIls: 300 }], [4, { id: 4, userId: 2, totalIls: 80 }]]);
  const refunds = [];
  let t = 1_000_000;
  const clock = { now: () => t, advance: (ms) => (t += ms) };
  const repo = {
    async get(id) { return orders.get(id) ?? null; },
    async refund(orderId, amount) { await new Promise((r) => setTimeout(r, 15)); refunds.push([orderId, amount]); },
  };
  return { repo, refunds, clock };
}

test("propose לא מחזיר כסף; confirm מחזיר פעם אחת", async () => {
  const s = setup();
  const a = createRefundActions({ orders: s.repo, now: s.clock.now });
  const p = await a.propose(1, { order_id: 3, amount_ils: 120 });
  assert.equal(p.summary, "החזר של 120 ש״ח על הזמנה 3");
  assert.match(p.actionId, /^[0-9a-f-]{36}$/, "randomUUID");
  assert.deepEqual(s.refunds, [], "propose לא קורא ל־refund");
  assert.deepEqual(await a.confirm(1, p.actionId), { status: "done" });
  assert.deepEqual(s.refunds, [[3, 120]]);
  assert.deepEqual(await a.confirm(1, p.actionId), { status: "already_done" });
  assert.deepEqual(s.refunds, [[3, 120]]);
  const p2 = await a.propose(1, { order_id: 3, amount_ils: 300 });
  assert.notEqual(p2.actionId, p.actionId);
});
test("propose: הזמנה של אחר, לא קיימת, סכום לא תקין", async () => {
  const s = setup();
  const a = createRefundActions({ orders: s.repo });
  await assert.rejects(a.propose(1, { order_id: 4, amount_ils: 10 }), /לא נמצאה/, "הזמנה של משתמש 2");
  await assert.rejects(a.propose(1, { order_id: 99, amount_ils: 10 }), /לא נמצאה/);
  for (const amount of [0, -5, 301, NaN]) await assert.rejects(a.propose(1, { order_id: 3, amount_ils: amount }), Error, String(amount));
});
test("confirm: משתמש אחר, מזהה לא קיים, פג תוקף", async () => {
  const s = setup();
  const a = createRefundActions({ orders: s.repo, now: s.clock.now, ttlMs: 60_000 });
  const p = await a.propose(1, { order_id: 3, amount_ils: 50 });
  await assert.rejects(a.confirm(2, p.actionId), /לא נמצאה/);
  await assert.rejects(a.confirm(1, "nope"), /לא נמצאה/);
  s.clock.advance(60_000);
  await assert.rejects(a.confirm(1, p.actionId), /פג תוקף/);
  assert.deepEqual(s.refunds, []);
  const d = createRefundActions({ orders: s.repo, now: s.clock.now });
  const q = await d.propose(1, { order_id: 3, amount_ils: 50 });
  s.clock.advance(9 * 60_000);
  assert.deepEqual(await d.confirm(1, q.actionId), { status: "done" }, "ברירת מחדל: 10 דקות");
});
test("שתי לחיצות במקביל ← החזר אחד", async () => {
  const s = setup();
  const a = createRefundActions({ orders: s.repo });
  const p = await a.propose(1, { order_id: 3, amount_ils: 70 });
  const r = await Promise.all([a.confirm(1, p.actionId), a.confirm(1, p.actionId)]);
  assert.deepEqual(r.map((x) => x.status).sort(), ["already_done", "done"]);
  assert.deepEqual(s.refunds, [[3, 70]]);
});
