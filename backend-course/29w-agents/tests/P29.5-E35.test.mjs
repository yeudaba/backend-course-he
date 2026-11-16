import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { chooseApproach } = await load(import.meta.url, "P29.5-E35.ts");
const all = { worthCost: true, modelGood: true, recoverable: true };

test("one / fixed", () => {
  assert.deepEqual(chooseApproach({ steps: "one", ...all }), { approach: "single_call", reasons: [] });
  assert.deepEqual(chooseApproach({ steps: "one", worthCost: false, modelGood: false, recoverable: false }), { approach: "single_call", reasons: [] });
  assert.deepEqual(chooseApproach({ steps: "fixed", ...all }), { approach: "workflow", reasons: ["steps_known"] });
});
test("open — סוכן רק כשהכול true; אחרת כל הסיבות בסדר", () => {
  assert.deepEqual(chooseApproach({ steps: "open", ...all }), { approach: "agent", reasons: [] });
  assert.deepEqual(chooseApproach({ steps: "open", ...all, recoverable: false }), { approach: "workflow", reasons: ["not_recoverable"] });
  assert.deepEqual(chooseApproach({ steps: "open", worthCost: false, modelGood: true, recoverable: false }), { approach: "workflow", reasons: ["not_worth_cost", "not_recoverable"] });
  assert.deepEqual(chooseApproach({ steps: "open", worthCost: false, modelGood: false, recoverable: false }), { approach: "workflow", reasons: ["not_worth_cost", "model_not_good", "not_recoverable"] });
  assert.deepEqual(chooseApproach({ steps: "open", ...all, modelGood: false }), { approach: "workflow", reasons: ["model_not_good"] });
});
