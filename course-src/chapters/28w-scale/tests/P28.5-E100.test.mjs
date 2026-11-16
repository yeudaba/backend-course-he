import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { checkBatch } = await load(import.meta.url, "P28.5-E100.ts");

const rows = [
  { id: 1, status: "paid", total: 1000 },
  { id: 2, status: "paid", total: null },
  { id: 2, status: "shipped", total: 50 },
  { id: 3, status: "lost", total: -5 },
  { id: 3, status: null, total: "12" },
  { id: 3, status: "paid", total: 999999 },
  { status: "paid", total: 10 },
];
const rules = [
  { kind: "unique", field: "id" },
  { kind: "notNull", field: "id" },
  { kind: "notNull", field: "total" },
  { kind: "accepted", field: "status", values: ["paid", "shipped", "cancelled"] },
  { kind: "range", field: "total", min: 0, max: 100000 },
];

test("כל הכללים", () => {
  assert.deepEqual(checkBatch(rows, rules), {
    ok: false,
    failures: [
      { rule: "unique:id", count: 3, examples: [2, 3] },
      { rule: "notNull:id", count: 1, examples: [undefined] },
      { rule: "notNull:total", count: 1, examples: [null] },
      { rule: "accepted:status", count: 2, examples: ["lost", null] },
      { rule: "range:total", count: 4, examples: [null, -5, "12"] },
    ],
  });
});
test("עובר", () => {
  assert.deepEqual(checkBatch([{ id: 1, total: 0 }, { id: 2, total: 100 }], [{ kind: "unique", field: "id" }, { kind: "range", field: "total", min: 0, max: 100 }]), { ok: true, failures: [] });
  assert.deepEqual(checkBatch([], rules), { ok: true, failures: [] });
});
