import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { log } from "./_log.mjs";

const { latencyReport } = await load(import.meta.url, "P30-E21.ts");
const by = (r) => Object.fromEntries(r.map((e) => [e.endpoint, e]));

test("מיון מספרי: 1000ms הוא האיטי", () => {
  assert.equal(by(latencyReport(["t GET /a 200 1000ms", "t GET /a 200 200ms", "t GET /a 200 30ms"]))["GET /a"].p95, 1000);
});
test("p95 ב־nearest-rank: 20 ערכים ← התשיעי־עשר, לא המקסימום; ערך אחד ← הוא עצמו", () => {
  const r = by(latencyReport(log));
  assert.equal(r["GET /products"].p95, 190);
  assert.equal(r["GET /orders/:id/items"].p95, 90);
});
test("שיעור שגיאות ביחס ל־endpoint", () => {
  const r = by(latencyReport(log));
  assert.equal(r["GET /orders/:id"].errorRate, 0.5);
  assert.equal(r["POST /orders"].errorRate, 0.333);
});
