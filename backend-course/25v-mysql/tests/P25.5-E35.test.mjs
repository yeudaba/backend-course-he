import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_sqlcheck.mjs";

const FILE = "P25.5-E35.sql";

test("על נתוני השיעור", async (t) => {
  const { got, expected } = await sameAsSolution(t, import.meta.url, FILE, { seed: "basics.sql" });
  assert.deepEqual(Object.keys(got[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן");
  assert.deepEqual(got, expected);
});
test("עם עוד קופונים", async (t) => {
  const extra = "INSERT INTO coupons (code, discount) VALUES ('SÁVE10', 1), ('save10 ', 2), ('save1', 3), ('sAvE10', 4)";
  const { got, expected } = await sameAsSolution(t, import.meta.url, FILE, { seed: "basics.sql", extra });
  assert.deepEqual(got, expected);
  assert.equal(got.filter((r) => Number(r.exact_match) === 1).length, 1, "רק save10 בדיוק");
});
