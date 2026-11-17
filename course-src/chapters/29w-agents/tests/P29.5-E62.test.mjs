import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { approvalSummary } = await load(import.meta.url, "P29.5-E62.ts");
const c = (name, input) => ({ id: "t1", name, input });

test("שלושת הכלים המוכרים", () => {
  assert.equal(approvalSummary(c("refund_order", { orderId: 201, amountCents: 8990 })), "החזר של 89.90 ₪ על הזמנה 201");
  assert.equal(approvalSummary(c("refund_order", { orderId: 7, amountCents: 1000 })), "החזר של 10.00 ₪ על הזמנה 7");
  assert.equal(approvalSummary(c("refund_order", { orderId: 7, amountCents: 5 })), "החזר של 0.05 ₪ על הזמנה 7");
  assert.equal(approvalSummary(c("cancel_order", { orderId: 201 })), "ביטול הזמנה 201");
  assert.equal(approvalSummary(c("send_email", { to: "dana@x.com", subject: "הזמנה בדרך" })), 'מייל ל־dana@x.com: "הזמנה בדרך"');
});
test("קלט לא תקין או כלי אחר ← name + JSON", () => {
  assert.equal(approvalSummary(c("refund_order", { orderId: 201, amountCents: 89.9 })), 'refund_order {"orderId":201,"amountCents":89.9}');
  assert.equal(approvalSummary(c("refund_order", { orderId: "201", amountCents: 100 })), 'refund_order {"orderId":"201","amountCents":100}');
  assert.equal(approvalSummary(c("refund_order", { orderId: 201, amountCents: -100 })), 'refund_order {"orderId":201,"amountCents":-100}');
  assert.equal(approvalSummary(c("refund_order", { orderId: 201 })), 'refund_order {"orderId":201}');
  assert.equal(approvalSummary(c("cancel_order", { orderId: 0 })), 'cancel_order {"orderId":0}');
  assert.equal(approvalSummary(c("send_email", { to: "", subject: "x" })), 'send_email {"to":"","subject":"x"}');
  assert.equal(approvalSummary(c("delete_account", { id: 3 })), 'delete_account {"id":3}');
});
test("escape", () => {
  assert.equal(approvalSummary(c("send_email", { to: "a@b.com", subject: "<img src=x onerror=alert(1)> & co" })), 'מייל ל־a@b.com: "&lt;img src=x onerror=alert(1)&gt; &amp; co"');
  assert.equal(approvalSummary(c("send_email", { to: "<b>@x", subject: "s" })), 'מייל ל־&lt;b&gt;@x: "s"');
  assert.equal(approvalSummary(c("x<y>", { a: "<&>" })), 'x&lt;y&gt; {"a":"&lt;&amp;&gt;"}');
});
