import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { handleToolCalls } = await load(import.meta.url, "P29.5-E22.ts");

function setup() {
  const ran = [];
  const tools = {
    refund_order: async (i) => (ran.push(["refund", i.orderId]), "refunded"),
    get_order: async (i) => (ran.push(["get", i.orderId]), "order"),
  };
  return { ran, tools };
}

test("באג 1: אישור לקריאה אחת לא מאשר קריאה אחרת לאותו כלי", async () => {
  const { ran, tools } = setup();
  const res = await handleToolCalls([{ id: "r1", name: "refund_order", input: { orderId: 101 } }, { id: "r2", name: "refund_order", input: { orderId: 102 } }], tools, { r1: "approve" });
  assert.deepEqual(ran, [["refund", 101]], "רק ההחזר שאושר רץ");
  assert.equal(res[1].is_error, true);
});
test("באג 2: סירוב ← הכלי לא רץ בכלל", async () => {
  const { ran, tools } = setup();
  const res = await handleToolCalls([{ id: "r1", name: "refund_order", input: { orderId: 101 } }], tools, {});
  assert.deepEqual(ran, []);
  assert.equal(res[0].is_error, true);
});
test("באג 3: deny הוא לא אישור", async () => {
  const { ran, tools } = setup();
  await handleToolCalls([{ id: "r1", name: "refund_order", input: { orderId: 101 } }], tools, { r1: "deny" });
  assert.deepEqual(ran, []);
});
test("כלים רגילים רצים בלי אישור", async () => {
  const { ran, tools } = setup();
  const res = await handleToolCalls([{ id: "g1", name: "get_order", input: { orderId: 7 } }], tools, {});
  assert.deepEqual(ran, [["get", 7]]);
  assert.deepEqual(res[0], { type: "tool_result", tool_use_id: "g1", content: "order" });
});
