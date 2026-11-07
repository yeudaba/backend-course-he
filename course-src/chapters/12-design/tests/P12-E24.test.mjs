import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { TransferService, NotFoundError, ValidationError, InsufficientFundsError } = await load(import.meta.url, "P12-E24.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E24.ts"); assert.ok(r.ok, r.output); });
function setup() {
  const store = new Map([["a", { id: "a", balanceAgorot: 10000 }], ["b", { id: "b", balanceAgorot: 0 }]]);
  const repo = { find: async (id) => (store.has(id) ? { ...store.get(id) } : null), save: async (w) => { store.set(w.id, { ...w }); } };
  return { store, svc: new TransferService(repo) };
}
test("העברה באגורות", async () => { const { store, svc } = setup(); const r = await svc.transfer({ from: "a", to: "b", amount: 19.9, idempotencyKey: "k" }); assert.deepEqual(r, { transferId: 1, fromBalance: 80.1, toBalance: 19.9 }); assert.equal(store.get("a").balanceAgorot, 8010); });
test("idempotency", async () => {
  const { store, svc } = setup();
  const r1 = await svc.transfer({ from: "a", to: "b", amount: 60, idempotencyKey: "k" });
  const r2 = await svc.transfer({ from: "a", to: "b", amount: 60, idempotencyKey: "k" });
  assert.deepEqual(r2, r1);
  assert.equal(store.get("a").balanceAgorot, 4000);
  await assert.rejects(svc.transfer({ from: "a", to: "b", amount: 60, idempotencyKey: "k2" }), InsufficientFundsError);
});
test("שגיאות", async () => {
  const { svc } = setup();
  await assert.rejects(svc.transfer({ from: "a", to: "z", amount: 1, idempotencyKey: "1" }), NotFoundError);
  await assert.rejects(svc.transfer({ from: "a", to: "a", amount: 1, idempotencyKey: "2" }), ValidationError);
  await assert.rejects(svc.transfer({ from: "a", to: "b", amount: 1.234, idempotencyKey: "3" }), ValidationError);
  await assert.rejects(svc.transfer({ from: "a", to: "b", amount: -5, idempotencyKey: "4" }), ValidationError);
});
