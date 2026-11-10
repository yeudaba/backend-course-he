// P28-E27 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { overallHealth, type Check } from "./P28-E27.ts";

const check = (name: string, over: Partial<Check> = {}): Check => ({ name, ok: true, critical: false, latencyMs: 10, ...over });

test("הכול תקין ← up, ובלי בדיקות ← up", () => {
  assert.deepEqual(overallHealth([check("db", { critical: true }), check("mail")]), { status: "up", failing: [], slow: [] });
  assert.deepEqual(overallHealth([]), { status: "up", failing: [], slow: [] });
});

test("בדיקה קריטית שנכשלה ← down, גם כשיש גם לא קריטית שנכשלה", () => {
  assert.deepEqual(overallHealth([check("db", { critical: true, ok: false }), check("mail")]), { status: "down", failing: ["db"], slow: [] });
  assert.deepEqual(overallHealth([check("mail", { ok: false }), check("db", { critical: true, ok: false })]), { status: "down", failing: ["mail", "db"], slow: [] });
});

test("בדיקה לא קריטית שנכשלה ← degraded", () => {
  assert.deepEqual(overallHealth([check("db", { critical: true }), check("mail", { ok: false })]), { status: "degraded", failing: ["mail"], slow: [] });
});

test("איטיות: מעל slowMs ← degraded; בדיוק slowMs — עוד לא", () => {
  assert.deepEqual(overallHealth([check("db", { critical: true, latencyMs: 1001 })]), { status: "degraded", failing: [], slow: ["db"] });
  assert.equal(overallHealth([check("db", { critical: true, latencyMs: 1000 })]).status, "up");
  assert.deepEqual(overallHealth([check("a", { latencyMs: 300 }), check("b", { latencyMs: 600 })], 500), { status: "degraded", failing: [], slow: ["b"] });
  assert.deepEqual(overallHealth([check("db", { critical: true, ok: false, latencyMs: 5000 })]), { status: "down", failing: ["db"], slow: ["db"] });
});
