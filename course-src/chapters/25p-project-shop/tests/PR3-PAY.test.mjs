import { test } from "node:test";
import assert from "node:assert/strict";
import { shop, key } from "./_shop.mjs";

// פרויקט 3, שלב 3: תשלום מדומה, ביטול ומשלוח
const OK = "4242424242424242";
const DECLINED = "4000000000000002";
const NO_FUNDS = "4000000000009995";

test("תשלום: נדחה, ואז מצליח", async (t) => {
  const { customer, product, orderOf } = await shop(t);
  const p = await product({ priceCents: 24900, stock: 5 });
  const dana = await customer();
  const order = await orderOf(dana, [[p.id, 2]]);
  const pay = (card, k = key("pay")) => dana("POST", `/orders/${order.id}/pay`, { cardNumber: card }, k);

  assert.equal((await dana("POST", `/orders/${order.id}/pay`, { cardNumber: OK })).status, 400, "בלי Idempotency-Key ← 400 (חיוב כפול זה גרוע מהזמנה כפולה)");
  const invalid = await pay("4242424242424241");
  assert.equal(invalid.status, 400, "מספר כרטיס לא תקין (Luhn) ← 400");

  const declined = await pay(DECLINED);
  assert.equal(declined.status, 402);
  assert.equal(declined.body.error.code, "PAYMENT_DECLINED");
  const noFunds = await pay(NO_FUNDS);
  assert.equal(noFunds.status, 402);
  assert.equal(noFunds.body.error.code, "PAYMENT_DECLINED");
  assert.equal((await dana("GET", `/orders/${order.id}`)).body.status, "pending_payment", "אחרי כישלון — עדיין מחכה לתשלום");

  const paid = await pay("4242 4242 4242 4242");
  assert.equal(paid.status, 200, `תשלום תקין: ${JSON.stringify(paid.body)}`);
  assert.equal(paid.body.status, "paid");
  assert.ok(paid.body.paidAt, "paidAt");
  const twice = await pay(OK);
  assert.equal(twice.status, 409, "כבר שולם ← 409");
  assert.equal(twice.body.error.code, "ORDER_NOT_PAYABLE");
  assert.ok(!JSON.stringify(paid.body).includes("4242424242424242"), "מספר הכרטיס לא חוזר בתשובה");
});

test("תשלום: אותו מפתח — חיוב אחד", async (t) => {
  const { customer, product, orderOf, db } = await shop(t);
  const p = await product({ stock: 5 });
  const dana = await customer();
  const order = await orderOf(dana, [[p.id, 1]]);
  const k = key("pay");
  const results = await Promise.all(Array.from({ length: 4 }, () => dana("POST", `/orders/${order.id}/pay`, { cardNumber: OK }, k)));
  assert.ok(results.some((r) => r.status === 200), results.map((r) => r.status).join());
  assert.ok(results.every((r) => r.status === 200 || r.status === 409), results.map((r) => r.status).join());
  const yossi = await customer();
  assert.equal((await yossi("POST", `/orders/${order.id}/pay`, { cardNumber: OK }, key())).status, 404, "הזמנה של אחר ← 404");
});

test("ביטול מחזיר מלאי; אחרי משלוח — אי אפשר", async (t) => {
  const { customer, product, orderOf, call, adminCall } = await shop(t);
  const p = await product({ stock: 5 });
  const dana = await customer();

  const o1 = await orderOf(dana, [[p.id, 2]]);
  assert.equal((await call("GET", `/products/${p.id}`)).body.stock, 3);
  const c1 = await dana("POST", `/orders/${o1.id}/cancel`);
  assert.equal(c1.status, 200);
  assert.equal(c1.body.status, "cancelled");
  assert.equal((await call("GET", `/products/${p.id}`)).body.stock, 5, "ביטול ← המלאי חזר");
  const again = await dana("POST", `/orders/${o1.id}/cancel`);
  assert.equal(again.status, 409, "ביטול כפול");
  assert.equal(again.body.error.code, "ORDER_NOT_CANCELLABLE");
  assert.equal((await call("GET", `/products/${p.id}`)).body.stock, 5, "…ולא החזיר מלאי פעמיים");
  assert.equal((await dana("POST", `/orders/${o1.id}/pay`, { cardNumber: OK }, key())).status, 409, "אי אפשר לשלם על הזמנה מבוטלת");

  const o2 = await orderOf(dana, [[p.id, 1]]);
  await dana("POST", `/orders/${o2.id}/pay`, { cardNumber: OK }, key());
  assert.equal((await dana("POST", `/orders/${o2.id}/ship`)).status, 403, "לקוח לא שולח");
  const shipped = await adminCall("POST", `/orders/${o2.id}/ship`);
  assert.equal(shipped.status, 200);
  assert.equal(shipped.body.status, "shipped");
  const late = await dana("POST", `/orders/${o2.id}/cancel`);
  assert.equal(late.status, 409, "נשלחה ← אי אפשר לבטל");

  const o3 = await orderOf(dana, [[p.id, 1]]);
  const notPaid = await adminCall("POST", `/orders/${o3.id}/ship`);
  assert.equal(notPaid.status, 409, "לא שולחים הזמנה שלא שולמה");
  assert.equal(notPaid.body.error.code, "ORDER_NOT_SHIPPABLE");
  await dana("POST", `/orders/${o3.id}/pay`, { cardNumber: OK }, key());
  const cancelPaid = await dana("POST", `/orders/${o3.id}/cancel`);
  assert.equal(cancelPaid.body.status, "cancelled", "שולמה ועוד לא נשלחה — אפשר לבטל");
  assert.equal((await call("GET", `/products/${p.id}`)).body.stock, 4, "5 − 1 (o2, נשלחה) = 4");
});

test("ביטול כפול במקביל — המלאי חוזר פעם אחת", async (t) => {
  const { customer, product, orderOf, call } = await shop(t);
  const p = await product({ stock: 5 });
  const dana = await customer();
  const o = await orderOf(dana, [[p.id, 3]]);
  const results = await Promise.all(Array.from({ length: 5 }, () => dana("POST", `/orders/${o.id}/cancel`)));
  assert.equal(results.filter((r) => r.status === 200).length, 1, results.map((r) => r.status).join());
  assert.equal((await call("GET", `/products/${p.id}`)).body.stock, 5);
});
