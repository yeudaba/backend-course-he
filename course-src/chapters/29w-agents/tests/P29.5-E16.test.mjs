import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { redactPII, checkRefund } = await load(import.meta.url, "P29.5-E16.ts");
const { createStore } = await import("../files/store.ts");

test("redactPII: טלפון, אימייל, ת״ז תקינה וכרטיס תקין", () => {
  assert.equal(redactPII("התקשרו ל־052-1234567 או 0521234567"), "התקשרו ל־[טלפון] או [טלפון]");
  assert.equal(redactPII("dana.levi@example.co.il"), "[אימייל]");
  assert.equal(redactPII("ת״ז 123456782"), "ת״ז [ת״ז]");
  assert.equal(redactPII("כרטיס 4580 1234 5678 9017"), "כרטיס 4580 1234 5678 9017", "Luhn לא תקין — לא כרטיס");
  assert.equal(redactPII("כרטיס 4580-0000-0000-0000"), "כרטיס [כרטיס]");
});
test("redactPII: לא מוחק מספרים רגילים", () => {
  const s = "הזמנה 101, סכום 89.90, מספר מעקב 123456789, 3 יחידות";
  assert.equal(redactPII(s), s);
});
test("checkRefund: החזר תקין", () => {
  const store = createStore();
  assert.deepEqual(checkRefund({ orderId: 101, amountCents: 5000 }, { store, customerId: 1, maxRefundCents: 20000 }), { ok: true });
});
test("checkRefund: כל הסיבות לסרב", () => {
  const store = createStore();
  store.refunds.push({ orderId: 102, amountCents: 18000 });
  store.orders.get(101).status = "cancelled";
  const ctx = { store, customerId: 1, maxRefundCents: 5000 };
  const no = (input, c = ctx) => checkRefund(input, c).ok;
  assert.equal(no({ orderId: 201, amountCents: 100 }), false, "הזמנה של לקוח אחר");
  assert.equal(no({ orderId: 999, amountCents: 100 }), false);
  assert.equal(no({ orderId: 102, amountCents: 0 }), false);
  assert.equal(no({ orderId: 102, amountCents: 1.5 }), false);
  assert.equal(no({ orderId: 101, amountCents: 100 }), false, "מבוטלת");
  assert.equal(no({ orderId: 102, amountCents: 1000 }), false, "כבר הוחזרו 180 מתוך 189");
  assert.equal(no({ orderId: 102, amountCents: 900 }), true);
  assert.equal(no({ orderId: 102, amountCents: 900 }, { ...ctx, maxRefundCents: 500 }), false, "מעל הסמכות של הסוכן");
  assert.match(checkRefund({ orderId: 201, amountCents: 1 }, ctx).reason, /לא נמצאה/, "בלי לגלות שההזמנה קיימת אצל לקוח אחר");
});
