import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { processDelivery } = await load(import.meta.url, "P26.5-E101.ts");

test("הצלחה, ואז אותה הודעה שוב ← duplicate", async () => {
  const seen = new Set();
  const calls = [];
  const handle = async (b) => { calls.push(b); };
  assert.equal(await processDelivery(seen, { id: "m1", body: { orderId: 1 } }, handle), "ack");
  assert.equal(await processDelivery(seen, { id: "m1", body: { orderId: 1 } }, handle), "duplicate");
  assert.equal(calls.length, 1, "בכפילות לא קוראים ל־handle");
});
test("כישלון ← retry, וההודעה מטופלת בניסיון הבא", async () => {
  const seen = new Set();
  let fail = true;
  const done = [];
  const handle = async (b) => {
    if (fail) throw new Error("payment provider timeout");
    done.push(b);
  };
  assert.equal(await processDelivery(seen, { id: "m2", body: { orderId: 2 } }, handle), "retry", "כישלון צריך להחזיר retry, לא ack");
  fail = false;
  assert.equal(await processDelivery(seen, { id: "m2", body: { orderId: 2 } }, handle), "ack", "ההודעה חזרה — היא לא כפילות, הניסיון הקודם נכשל");
  assert.deepEqual(done, [{ orderId: 2 }]);
});
test("שתי הודעות שונות עם אותו תוכן — שתיהן מטופלות", async () => {
  const seen = new Set();
  const done = [];
  const handle = async (b) => { done.push(b); };
  const body = { customer: "c1", product: "p1", qty: 1 };
  assert.equal(await processDelivery(seen, { id: "a", body }, handle), "ack");
  assert.equal(await processDelivery(seen, { id: "b", body: { ...body } }, handle), "ack", "id שונה — הודעה אחרת, גם אם התוכן זהה");
  assert.equal(done.length, 2);
});
