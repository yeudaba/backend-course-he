import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P19-E45.ts";
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("toCamel", async () => {
  const { toCamel } = await exportsOf(import.meta.url, FILE, ["toCamel", "camelize"]);
  const cases = { full_name: "fullName", is_active: "isActive", created_at_utc: "createdAtUtc", id: "id", _private: "_private", a__b: "a__b", trailing_: "trailing_", unit_price2: "unitPrice2", line_2: "line2", already: "already", orderId: "orderId" };
  for (const [from, to] of Object.entries(cases)) assert.equal(toCamel(from), to, from);
});
test("camelize", async () => {
  const { camelize } = await exportsOf(import.meta.url, FILE, ["toCamel", "camelize"]);
  const d = new Date("2026-01-05T07:12:00Z");
  const row = { id: 1, full_name: "Dana", created_at: d, city: null, is_active: false };
  const out = camelize(row);
  assert.deepEqual(Object.keys(out), ["id", "fullName", "createdAt", "city", "isActive"]);
  assert.equal(out.createdAt, d, "אותו אובייקט Date");
  assert.equal(out.city, null);
  assert.equal(out.isActive, false);
  assert.notEqual(out, row);
  assert.deepEqual(Object.keys(row), ["id", "full_name", "created_at", "city", "is_active"], "המקור לא השתנה");
  assert.deepEqual(camelize({}), {});
});
