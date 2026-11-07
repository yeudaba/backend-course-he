import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { applyOrder, processOrders } = await load(import.meta.url, "P07-E24.js");

test("applyOrder מצליח ולא משנה את המקור", () => {
  const inv = { A: 5, B: 1 };
  assert.deepEqual(applyOrder(inv, { id: 1, items: [{ code: "A", qty: 2 }, { code: "B", qty: 1 }] }), { ok: true, inventory: { A: 3, B: 0 } });
  assert.deepEqual(inv, { A: 5, B: 1 });
});
test("applyOrder — מוצר לא קיים", () => {
  const inv = { A: 5 };
  const r = applyOrder(inv, { id: 1, items: [{ code: "Z", qty: 1 }] });
  assert.deepEqual(r, { ok: false, inventory: inv, error: "מוצר Z לא קיים" });
});
test("applyOrder — הכול או כלום", () => {
  const inv = { A: 5, B: 0 };
  const r = applyOrder(inv, { id: 1, items: [{ code: "A", qty: 2 }, { code: "B", qty: 1 }] });
  assert.equal(r.ok, false);
  assert.equal(r.error, "אין מספיק מלאי של B (נשארו 0)");
  assert.deepEqual(r.inventory, { A: 5, B: 0 });
});
test("applyOrder — אותו קוד פעמיים", () => assert.equal(applyOrder({ A: 3 }, { id: 1, items: [{ code: "A", qty: 2 }, { code: "A", qty: 2 }] }).ok, false));
test("processOrders", () => {
  const inv = { A: 5, B: 1 };
  const orders = [
    { id: 1, items: [{ code: "A", qty: 2 }, { code: "B", qty: 1 }] },
    { id: 2, items: [{ code: "B", qty: 1 }] },
    { id: 3, items: [{ code: "A", qty: 3 }] },
  ];
  assert.deepEqual(processOrders(inv, orders), { inventory: { A: 0, B: 0 }, accepted: [1, 3], rejected: [{ id: 2, error: "אין מספיק מלאי של B (נשארו 0)" }] });
  assert.deepEqual(inv, { A: 5, B: 1 });
});
