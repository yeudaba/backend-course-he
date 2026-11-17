import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { costPerConversation } = await load(import.meta.url, "P29.5-E91.ts");
const m = (c, cost, ms = 100) => ({ conversationId: c, kind: "model", costUsd: cost, ms });
const t = (c, ms, isError) => ({ conversationId: c, kind: "tool", ms, ...(isError === undefined ? {} : { isError }) });

test("סיכום לפי שיחה, מהיקרה לזולה", () => {
  const spans = [m("b", 0.01), t("b", 20), m("a", 0.1), t("a", 15, true), t("a", 5, false), m("a", 0.2), m("c", 0.01), t("c", 3, true), m("b", 0.02)];
  assert.deepEqual(costPerConversation(spans), [
    { conversationId: "a", steps: 2, tools: 2, toolErrors: 1, costUsd: 0.3, ms: 220 },
    { conversationId: "b", steps: 2, tools: 1, toolErrors: 0, costUsd: 0.03, ms: 220 },
    { conversationId: "c", steps: 1, tools: 1, toolErrors: 1, costUsd: 0.01, ms: 103 },
  ]);
});
test("תיקו, עלות חסרה, ריק", () => {
  assert.deepEqual(costPerConversation([m("z", 0.05), m("y", 0.05), { conversationId: "x", kind: "model", ms: 1 }]).map((r) => [r.conversationId, r.costUsd]), [["y", 0.05], ["z", 0.05], ["x", 0]]);
  assert.deepEqual(costPerConversation([]), []);
  assert.equal(costPerConversation([m("a", 0.1), m("a", 0.2)])[0].costUsd, 0.3, "עיגול בסוף");
});
