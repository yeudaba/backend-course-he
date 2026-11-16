import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toolsForRole } = await load(import.meta.url, "P29-E71.ts");

function registry(calls) {
  const tool = (name) => ({ name, description: name, input_schema: { type: "object", properties: {} } });
  return [
    { tool: tool("search_products"), roles: ["customer", "staff"], handler: async (i) => (calls.push(["search", i]), "[]") },
    { tool: tool("get_order"), roles: ["customer", "staff"], handler: async (i) => { calls.push(["get", i]); if (i.id === 0) throw new Error("order not found"); return `{"id":${i.id}}`; } },
    { tool: tool("refund_report"), roles: ["staff"], handler: async () => (calls.push(["report"]), "report") },
  ];
}

test("tools: רק המותרים, לפי הסדר", () => {
  const reg = registry([]);
  assert.deepEqual(toolsForRole("customer", reg).tools.map((t) => t.name), ["search_products", "get_order"]);
  assert.deepEqual(toolsForRole("staff", reg).tools.map((t) => t.name), ["search_products", "get_order", "refund_report"]);
  assert.deepEqual(toolsForRole("guest", reg).tools, []);
  assert.equal(toolsForRole("staff", reg).tools[0], reg[0].tool, "אותו אובייקט כלי");
});
test("run: מותר, נכשל, לא מותר, לא קיים", async () => {
  const calls = [];
  const t = toolsForRole("customer", registry(calls));
  assert.deepEqual(await t.run("get_order", { id: 3 }), { content: '{"id":3}' });
  assert.deepEqual(await t.run("get_order", { id: 0 }), { content: "order not found", is_error: true });
  assert.deepEqual(await t.run("refund_report", {}), { content: "tool not allowed", is_error: true });
  assert.deepEqual(await t.run("drop_db", {}), { content: "unknown tool", is_error: true });
  assert.deepEqual(calls, [["get", { id: 3 }], ["get", { id: 0 }]], "ה־handler של כלי לא מותר לא רץ");
  const staff = toolsForRole("staff", registry(calls));
  assert.deepEqual(await staff.run("refund_report", {}), { content: "report" });
});
