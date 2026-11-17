import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { mergeTools } = await load(import.meta.url, "P29.5-E50.ts");
const schema = (p = {}) => ({ $schema: "http://json-schema.org/draft-07/schema#", type: "object", properties: p });

test("איחוד, שמות, וניתוב חזרה", () => {
  const m = mergeTools([
    { prefix: "shop", tools: [{ name: "search", description: "products", inputSchema: schema({ q: { type: "string" } }) }, { name: "get_order", inputSchema: schema() }] },
    { prefix: "docs2", tools: [{ name: "search", description: "docs", inputSchema: { type: "object" } }] },
  ]);
  assert.deepEqual(m.tools, [
    { name: "shop_search", description: "products", input_schema: { type: "object", properties: { q: { type: "string" } } } },
    { name: "shop_get_order", description: "", input_schema: { type: "object", properties: {} } },
    { name: "docs2_search", description: "docs", input_schema: { type: "object" } },
  ]);
  assert.deepEqual(m.route("shop_get_order"), { prefix: "shop", tool: "get_order" });
  assert.deepEqual(m.route("docs2_search"), { prefix: "docs2", tool: "search" });
  assert.equal(m.route("shop_delete"), null);
  assert.equal(m.route("search"), null);
  assert.deepEqual(mergeTools([]).tools, []);
});
test("שגיאות", () => {
  for (const prefix of ["Shop", "2x", "", "a_b", "a-b"]) assert.throws(() => mergeTools([{ prefix, tools: [] }]), Error, `prefix "${prefix}"`);
  assert.throws(() => mergeTools([{ prefix: "a", tools: [{ name: "x".repeat(63), inputSchema: schema() }] }]), Error, "65 תווים");
  assert.doesNotThrow(() => mergeTools([{ prefix: "a", tools: [{ name: "x".repeat(62), inputSchema: schema() }] }]));
  assert.throws(() => mergeTools([{ prefix: "a", tools: [{ name: "get order", inputSchema: schema() }] }]), Error);
  assert.throws(() => mergeTools([{ prefix: "a", tools: [{ name: "הזמנה", inputSchema: schema() }] }]), Error);
  assert.doesNotThrow(() => mergeTools([{ prefix: "a", tools: [{ name: "b_c", inputSchema: schema() }] }, { prefix: "ab", tools: [{ name: "c", inputSchema: schema() }] }]), "a_b_c ו־ab_c שונים");
  assert.throws(() => mergeTools([{ prefix: "a", tools: [{ name: "b_c", inputSchema: schema() }] }, { prefix: "a", tools: [{ name: "b_c", inputSchema: schema() }] }]), Error, "שם כפול");
});
