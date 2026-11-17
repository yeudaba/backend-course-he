import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { handleJob } = await load(import.meta.url, "P26-E99.ts");

function deps() {
  const calls = [];
  return {
    calls,
    emails: { sendOrderConfirmation: async (id) => { calls.push(["email", id]); return id === 9 ? "duplicate" : "sent"; } },
    orders: { expire: async (id) => { calls.push(["expire", id]); if (id === 13) throw new Error("db down"); return "expired"; } },
  };
}

test("ניתוב לפי שם", async () => {
  const d = deps();
  assert.equal(await handleJob({ name: "order-confirmation", data: { orderId: 7 } }, d), "sent");
  assert.equal(await handleJob({ name: "order-confirmation", data: { orderId: 9 } }, d), "duplicate");
  assert.equal(await handleJob({ name: "expire-order", data: { orderId: 8 } }, d), "expired");
  assert.deepEqual(d.calls, [["email", 7], ["email", 9], ["expire", 8]]);
});
test("שם לא מוכר ← שגיאה; שגיאת שירות עולה", async () => {
  const d = deps();
  await assert.rejects(handleJob({ name: "send-sms", data: { orderId: 1 } }, d), { message: "עבודה לא מוכרת: send-sms" });
  await assert.rejects(handleJob({ name: "expire-order", data: { orderId: 13 } }, d), { message: "db down" });
  assert.deepEqual(d.calls, [["expire", 13]]);
});
