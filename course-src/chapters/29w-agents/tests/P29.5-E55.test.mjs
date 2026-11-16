import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { audited } = await load(import.meta.url, "P29.5-E55.ts");

function clock() {
  let t = 1000;
  return { now: () => t, advance: (ms) => (t += ms) };
}

test("הצלחה ו־isError: שורה אחת, args מוסתרים בעותק", async () => {
  const logs = [];
  const c = clock();
  const seen = [];
  const h = audited("get_order", async (args) => { seen.push(args); c.advance(42); return args.orderId === 9 ? { content: [{ type: "text", text: "not found" }], isError: true } : { content: [{ type: "text", text: '{"id":3}' }] }; }, { log: (e) => logs.push(e), customerId: 7, now: c.now, redact: ["email", "card"] });
  const args = { orderId: 3, email: "dana@x.com", note: "hi" };
  assert.deepEqual(await h(args), { content: [{ type: "text", text: '{"id":3}' }] });
  assert.deepEqual(seen[0], { orderId: 3, email: "dana@x.com", note: "hi" }, "ה־handler מקבל את המקור");
  assert.deepEqual(args.email, "dana@x.com");
  await h({ orderId: 9 });
  assert.deepEqual(logs, [
    { msg: "mcp_tool", tool: "get_order", customerId: 7, ms: 42, isError: false, args: { orderId: 3, email: "[REDACTED]", note: "hi" } },
    { msg: "mcp_tool", tool: "get_order", customerId: 7, ms: 42, isError: true, args: { orderId: 9 } },
  ]);
});
test("handler זרק ← internal error למודל, והשגיאה בלוג", async () => {
  const logs = [];
  const h = audited("refund", async () => { throw new Error("pg: connection refused 10.0.0.5"); }, { log: (e) => logs.push(e), customerId: 1 });
  assert.deepEqual(await h({ orderId: 1 }), { content: [{ type: "text", text: "internal error" }], isError: true });
  assert.equal(logs.length, 1);
  assert.equal(logs[0].isError, true);
  assert.equal(logs[0].error, "pg: connection refused 10.0.0.5");
  assert.equal(typeof logs[0].ms, "number");
  assert.deepEqual(logs[0].args, { orderId: 1 });
});
