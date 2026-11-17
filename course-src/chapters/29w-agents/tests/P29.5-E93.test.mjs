import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { progressText } = await load(import.meta.url, "P29.5-E93.ts");
const L = { get_order: "בודק את ההזמנה…", search_products: "מחפש במלאי…" };

test("כל סוגי האירועים", () => {
  assert.equal(progressText({ type: "model", step: 1 }, L), "חושב…");
  assert.equal(progressText({ type: "model", step: 2 }, L), null);
  assert.equal(progressText({ type: "tool_start", name: "get_order", input: { orderId: 201 } }, L), "בודק את ההזמנה…");
  assert.equal(progressText({ type: "tool_start", name: "check_fraud_score", input: { email: "a@b.com" } }, L), "עובד על זה…");
  assert.equal(progressText({ type: "tool_start", name: "toString", input: {} }, L), "עובד על זה…");
  assert.equal(progressText({ type: "tool_end", name: "get_order", isError: true }, L), "משהו לא הצליח, מנסה דרך אחרת…");
  assert.equal(progressText({ type: "tool_end", name: "get_order", isError: false }, L), null);
  assert.equal(progressText({ type: "done" }, L), null);
  assert.equal(progressText({ type: "error" }, L), "לא הצלחתי להשלים — נסה שוב או פנה לנציג");
});
