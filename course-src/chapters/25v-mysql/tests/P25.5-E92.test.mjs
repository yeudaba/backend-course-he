import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_sqlcheck.mjs";

const FILE = "P25.5-E92.sql";

test("על הטבלה מהקובץ", async (t) => {
  const { got, expected } = await sameAsSolution(t, import.meta.url, FILE, { seed: "indexes.sql" });
  assert.deepEqual(Object.keys(got[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן");
  assert.deepEqual(got.map((r) => ({ ...r, is_unique: Number(r.is_unique), redundant: Number(r.redundant) })), expected.map((r) => ({ ...r, is_unique: Number(r.is_unique), redundant: Number(r.redundant) })));
});
test("עם עוד אינדקסים", async (t) => {
  const extra = "ALTER TABLE events_log ADD COLUMN kind_x INT NULL, ADD KEY idx_kindx (kind_x), ADD KEY idx_kind_created (kind, created_at), ADD KEY idx_created (created_at)";
  const { got, expected } = await sameAsSolution(t, import.meta.url, FILE, { seed: "indexes.sql", extra });
  const n = (rows) => rows.map((r) => ({ ...r, is_unique: Number(r.is_unique), redundant: Number(r.redundant) }));
  assert.deepEqual(n(got), n(expected));
});
