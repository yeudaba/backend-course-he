import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { evaluateTrajectory } = await load(import.meta.url, "P29.5-E13.ts");
const tr = (names, finalText = "", steps = names.length + 1) => ({ toolCalls: names.map((name) => ({ name, input: {} })), finalText, steps });

test("מסלול טוב עובר", () => {
  const r = evaluateTrajectory(tr(["get_order", "refund_order"], "הוחזרו 89.90 ₪"), { mustCall: ["get_order", "refund_order"], order: [["get_order", "refund_order"]], finalIncludes: ["89.90"], maxSteps: 5 });
  assert.deepEqual(r, { pass: true, failures: [] });
});
test("כל סוג כישלון מדווח", () => {
  const r = evaluateTrajectory(tr(["refund_order", "get_order", "delete_account", "x", "y"], "Done!", 9), {
    mustCall: ["search"],
    mustNotCall: ["delete_account"],
    order: [["get_order", "refund_order"]],
    maxSteps: 5,
    maxToolCalls: 3,
    finalIncludes: ["הוחזר"],
    finalExcludes: ["done"],
  });
  assert.equal(r.pass, false);
  assert.equal(r.failures.length, 7, r.failures.join(" | "));
});
test("order: b בלי a ← כישלון; a בלי b ← בסדר", () => {
  assert.equal(evaluateTrajectory(tr(["refund_order"]), { order: [["get_order", "refund_order"]] }).pass, false);
  assert.equal(evaluateTrajectory(tr(["get_order"]), { order: [["get_order", "refund_order"]] }).pass, true);
});
test("השוואת טקסט לא רגישה לרישיות", () => {
  assert.equal(evaluateTrajectory(tr([], "Order #101 is SHIPPED"), { finalIncludes: ["shipped"] }).pass, true);
});
