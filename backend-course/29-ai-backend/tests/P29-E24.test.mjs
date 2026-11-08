import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { triageTicket } = await load(import.meta.url, "P29-E24.ts");
const cls = (o) => message(JSON.stringify(o));

test("שאלה רגילה ← סיווג, ואז טיוטה", async () => {
  const { client, bodies } = fakeClaude((b, i) => (i === 0 ? cls({ category: "order_status", refund_amount_ils: null, confidence: "high" }) : message("שלום, ההזמנה בדרך.")));
  assert.deepEqual(await triageTicket(client, "איפה ההזמנה שלי?"), { action: "draft", category: "order_status", draft: "שלום, ההזמנה בדרך." });
  assert.equal(bodies().length, 2);
  assert.equal(bodies()[0].output_config?.format?.type, "json_schema");
  assert.match(userText(bodies()[1].messages[0]), /order_status/);
});
test("כללים בקוד ← בן אדם, בלי קריאה שנייה", async () => {
  const cases = [
    [{ category: "refund", refund_amount_ils: 649, confidence: "high" }, "refund_over_limit"],
    [{ category: "refund", refund_amount_ils: null, confidence: "high" }, "refund_over_limit"],
    [{ category: "complaint", refund_amount_ils: null, confidence: "high" }, "complaint"],
    [{ category: "product_question", refund_amount_ils: null, confidence: "low" }, "low_confidence"],
  ];
  for (const [c, reason] of cases) {
    const { client, bodies } = fakeClaude(() => cls(c));
    const r = await triageTicket(client, "...");
    assert.equal(r.action, "human");
    assert.equal(r.reason, reason);
    assert.equal(bodies().length, 1, reason);
  }
});
test("החזר קטן ← טיוטה; refundLimitIls ניתן לשינוי", async () => {
  const mk = () => fakeClaude((b, i) => (i === 0 ? cls({ category: "refund", refund_amount_ils: 120, confidence: "medium" }) : message("טיוטה")));
  assert.equal((await triageTicket(mk().client, "x")).action, "draft");
  assert.equal((await triageTicket(mk().client, "x", { refundLimitIls: 100 })).reason, "refund_over_limit");
});
test("סיווג שנכשל או טיוטה חתוכה ← בן אדם; שגיאת API עולה", async () => {
  assert.equal((await triageTicket(fakeClaude(() => message("{bad", { stop_reason: "max_tokens" })).client, "x")).reason, "classification_failed");
  const t = fakeClaude((b, i) => (i === 0 ? cls({ category: "product_question", refund_amount_ils: null, confidence: "high" }) : message("חצי", { stop_reason: "max_tokens" })));
  assert.equal((await triageTicket(t.client, "x")).reason, "draft_failed");
  await assert.rejects(triageTicket(fakeClaude(() => ({ error: 500 })).client, "x"), (e) => e.status === 500);
});
