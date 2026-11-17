import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { findTraceIssues } = await load(import.meta.url, "P29.5-E92.ts");
const tool = (name, input, ms = 10, isError = false) => ({ name, input, ms, isError });

test("כל הסוגים, מקובצים ובסדר", () => {
  const steps = [
    { step: 1, stopReason: "tool_use", cacheRead: 0, tools: [tool("search", { q: "v60", limit: 5 }, 2900)] },
    { step: 2, stopReason: "tool_use", cacheRead: 3000, tools: [tool("get_order", { orderId: 101 }), tool("search", { limit: 5, q: "v60" })] },
    { step: 3, stopReason: "tool_use", cacheRead: 0, tools: [tool("get_order", { orderId: 101 }, 3100, true)] },
    { step: 4, stopReason: "tool_use", cacheRead: 0, tools: [tool("get_order", { orderId: 101 }), tool("search", { q: "v60", limit: 5 })] },
    { step: 5, stopReason: "max_tokens", cacheRead: 5000, tools: [tool("get_order", { orderId: 101 })] },
  ];
  assert.deepEqual(findTraceIssues(steps, { slowMs: 1000, repeat: 3 }), ["repeat:get_order", "repeat:search", "slow:search@1", "slow:get_order@3", "no_cache@3", "no_cache@4", "max_tokens@5"]);
});
test("סף repeat, קלטים שונים, ריק", () => {
  const steps = [
    { step: 7, stopReason: "tool_use", cacheRead: 0, tools: [tool("a", { x: 1 }), tool("a", { x: 2 }), tool("a", { x: 1 })] },
    { step: 8, stopReason: "end_turn", cacheRead: 10, tools: [] },
  ];
  assert.deepEqual(findTraceIssues(steps, { slowMs: 10, repeat: 2 }), ["repeat:a"], "‏ms == slowMs אינו איטי; הצעד הראשון בלי cache זה תקין");
  assert.deepEqual(findTraceIssues(steps, { slowMs: 10, repeat: 3 }), []);
  assert.deepEqual(findTraceIssues([], { slowMs: 1, repeat: 2 }), []);
  assert.deepEqual(findTraceIssues([{ step: 1, stopReason: "x", cacheRead: 0, tools: [tool("a", [1, { b: 1, c: 2 }]), tool("a", [1, { c: 2, b: 1 }]), tool("a", [{ c: 2, b: 1 }, 1])] }], { slowMs: 99, repeat: 2 }), ["repeat:a"]);
});
