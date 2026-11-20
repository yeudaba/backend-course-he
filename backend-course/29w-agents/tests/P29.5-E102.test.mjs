import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { summarizeTrace } = await load(import.meta.url, "P29.5-E102.ts");
const trace = () => [
  { kind: "model", costUsd: 0.0146, ms: 900 },
  { kind: "tool", name: "list_my_orders", ms: 14, isError: false },
  { kind: "model", costUsd: 0.021, ms: 1100 },
  { kind: "tool", name: "get_order", ms: 2950, isError: true },
  { kind: "tool", name: "search_products", ms: 120, isError: false },
  { kind: "model", costUsd: 0.0001, ms: 300 },
];

test("סיכום", () => {
  assert.deepEqual(summarizeTrace(trace()), { steps: 3, toolCalls: 3, toolErrors: 1, costUsd: 0.0357, slowestTool: "get_order" });
});
test("ה־spans לא משתנים", () => {
  const t = trace();
  const before = JSON.stringify(t);
  summarizeTrace(t);
  assert.equal(JSON.stringify(t), before, "summarizeTrace שינתה את סדר ה־spans");
});
test("בלי כלים, ועלות של שברים", () => {
  assert.deepEqual(summarizeTrace([{ kind: "model", costUsd: 0.1, ms: 1 }, { kind: "model", costUsd: 0.2, ms: 1 }]), { steps: 2, toolCalls: 0, toolErrors: 0, costUsd: 0.3, slowestTool: null });
  assert.deepEqual(summarizeTrace([]), { steps: 0, toolCalls: 0, toolErrors: 0, costUsd: 0, slowestTool: null });
});
