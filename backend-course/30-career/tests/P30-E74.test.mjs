import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { scoreAnswer } = await load(import.meta.url, "P30-E74.ts");
const R = [
  { id: "what", any: ["conditional update", "for update"] },
  { id: "how_mine", any: ["in my project", "i used", "אצלי"] },
  { id: "why", any: ["because", "כי"] },
  { id: "cost", any: ["trade-off", "tradeoff", "the cost", "המחיר"] },
];

test("ציון ומה חסר", () => {
  assert.deepEqual(scoreAnswer("In my project I used a Conditional UPDATE because it's one statement.", R), { score: 3, max: 4, missing: ["cost"] });
  assert.deepEqual(scoreAnswer("It's a transaction.", R), { score: 0, max: 4, missing: ["what", "how_mine", "why", "cost"] });
  assert.deepEqual(scoreAnswer("אצלי — FOR UPDATE, כי פשוט; המחיר: נעילה", R), { score: 4, max: 4, missing: [] });
  assert.deepEqual(scoreAnswer("anything", [{ id: "x", any: [] }]), { score: 0, max: 1, missing: ["x"] });
  assert.deepEqual(scoreAnswer("x", []), { score: 0, max: 0, missing: [] });
});
