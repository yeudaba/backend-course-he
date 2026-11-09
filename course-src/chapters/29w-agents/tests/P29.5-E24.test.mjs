import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse } from "./_claude.mjs";

const { createSupportAgent } = await load(import.meta.url, "P29.5-E24.ts");
const { createStore } = await import("../files/store.ts");
const lastResults = (b) => b.messages.at(-1).content;

test("החזר: get_order ← refund (ממתין לאישור) ← אישור ← בוצע; התשובה בלי פרטים אישיים", async () => {
  const store = createStore();
  const { client, bodies } = fakeClaude((b, i) =>
    [
      message([toolUse("get_order", { orderId: 101 }, "g1")], { stop_reason: "tool_use" }),
      message([toolUse("refund_order", { orderId: 101, amountCents: 8990 }, "r1")], { stop_reason: "tool_use" }),
      message("החזרתי 89.90 ₪. לשאלות: 052-7654321 או support@coffee.example"),
    ][i],
  );
  const agent = createSupportAgent({ client, store, customerId: 1 });
  const t1 = await agent.start("אפשר החזר על הזמנה 101? הפולי היו שרופים");
  assert.equal(t1.status, "needs_approval");
  assert.deepEqual(t1.pending.map((p) => [p.id, p.name, p.input]), [["r1", "refund_order", { orderId: 101, amountCents: 8990 }]]);
  assert.deepEqual(store.refunds, [], "עוד לא הוחזר כלום");
  assert.match(lastResults(bodies()[1])[0].content, /paid/, "get_order רץ בלי אישור");
  const t2 = await agent.resume(JSON.parse(JSON.stringify(t1.state)), { r1: "approve" });
  assert.equal(t2.status, "done");
  assert.deepEqual(store.refunds, [{ orderId: 101, amountCents: 8990 }]);
  assert.equal(t2.text, "החזרתי 89.90 ₪. לשאלות: [טלפון] או [אימייל]");
});
test("guardrails בקוד — גם אחרי אישור: הזמנה של אחר, סכום גדול מדי", async () => {
  const store = createStore();
  const { client, bodies } = fakeClaude((b, i) =>
    [message([toolUse("refund_order", { orderId: 201, amountCents: 6900 }, "x1"), toolUse("refund_order", { orderId: 102, amountCents: 18900 }, "x2")], { stop_reason: "tool_use" }), message("לא הצלחתי")][i],
  );
  const agent = createSupportAgent({ client, store, customerId: 1, maxRefundCents: 10000 });
  const t1 = await agent.start("החזר הכול");
  const t2 = await agent.resume(t1.state, { x1: "approve", x2: "approve" });
  assert.equal(t2.status, "done");
  assert.deepEqual(store.refunds, []);
  const res = lastResults(bodies()[1]);
  assert.ok(res.every((r) => r.is_error), "שתי השגיאות חוזרות למודל");
  assert.match(res[0].content, /לא נמצאה/);
  assert.match(res[1].content, /נציג/);
});
test("סירוב של הלקוח ← אין החזר, והמודל יודע", async () => {
  const store = createStore();
  const { client, bodies } = fakeClaude((b, i) => [message([toolUse("refund_order", { orderId: 101, amountCents: 100 }, "r")], { stop_reason: "tool_use" }), message("בסדר")][i]);
  const agent = createSupportAgent({ client, store, customerId: 1 });
  const t1 = await agent.start("החזר 1 ש״ח");
  await agent.resume(t1.state, { r: "deny" });
  assert.deepEqual(store.refunds, []);
  assert.equal(lastResults(bodies()[1])[0].is_error, true);
});
test("system prompt וכלים בבקשה", async () => {
  const { client, bodies } = fakeClaude(() => message("שלום"));
  await createSupportAgent({ client, store: createStore(), customerId: 1 }).start("היי");
  const b = bodies()[0];
  assert.ok(typeof b.system === "string" && b.system.length > 50);
  assert.deepEqual(b.tools.map((t) => t.name).sort(), ["get_order", "refund_order"]);
  assert.equal(b.model, "claude-opus-5-5");
});
