import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { createPayment } = await load(import.meta.url, "P24-E16.ts");

test("פעם ראשונה ופעם שנייה", async (t) => {
  const db = await sandbox(t, import.meta.url, "payments.sql");
  const pool = db.pool(5);
  const a = await createPayment(pool, 1, "pay-0001", 4990);
  assert.deepEqual(a, { replayed: false, payment: { id: 1, userId: 1, amountCents: 4990 } });
  const b = await createPayment(pool, 1, "pay-0001", 4990);
  assert.deepEqual(b, { replayed: true, payment: { id: 1, userId: 1, amountCents: 4990 } });
  assert.equal((await createPayment(pool, 2, "pay-0001", 4990)).payment.id, 2, "משתמש אחר — תשלום משלו");
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM payments"))[0].n, 2);
  const [k] = await db.rows("SELECT payment_id FROM idempotency_keys WHERE user_id = 1");
  assert.equal(k.payment_id, 1, "המפתח מצביע על התשלום");
});
test("אותו מפתח, סכום אחר", async (t) => {
  const db = await sandbox(t, import.meta.url, "payments.sql");
  const pool = db.pool(5);
  await createPayment(pool, 1, "pay-0001", 4990);
  await assert.rejects(createPayment(pool, 1, "pay-0001", 9990), { message: "IDEMPOTENCY_KEY_REUSED" });
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM payments"))[0].n, 1);
});
test("20 בקשות במקביל ← תשלום אחד", async (t) => {
  const db = await sandbox(t, import.meta.url, "payments.sql");
  const pool = db.pool(10);
  const results = await Promise.all(Array.from({ length: 20 }, () => createPayment(pool, 1, "pay-race", 1500)));
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM payments"))[0].n, 1, "במסד — תשלום אחד בלבד");
  assert.equal(results.filter((r) => !r.replayed).length, 1, "רק בקשה אחת יצרה");
  assert.ok(results.every((r) => r.payment.id === results[0].payment.id), "כולן מחזירות את אותו תשלום");
});
test("כישלון באמצע — לא משאיר מפתח תפוס", async (t) => {
  const db = await sandbox(t, import.meta.url, "payments.sql");
  const pool = db.pool(5);
  await assert.rejects(createPayment(pool, 1, "pay-bad", -5), "CHECK נכשל");
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM idempotency_keys"))[0].n, 0, "ROLLBACK — גם המפתח לא נשמר");
  assert.equal((await createPayment(pool, 1, "pay-bad", 500)).replayed, false, "אפשר לנסות שוב");
  assert.equal(pool.totalCount - pool.idleCount, 0, "כל החיבורים חזרו ל־pool");
});
