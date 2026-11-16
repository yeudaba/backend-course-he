import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { pickFields } = await load(import.meta.url, "P29.5-E77.ts");
const rows = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, status: i % 2 ? "paid" : "shipped", total: 100 * (i + 1), address: "רחוב הרצל 1", items: [1, 2, 3] }));

test("שדות נבחרים, בסדר של fields, עם note", () => {
  const out = pickFields(rows, ["status", "id"], { maxRows: 2 });
  assert.equal(out, '{"rows":[{"status":"shipped","id":1},{"status":"paid","id":2}],"total":5,"omitted":3,"note":"showing 2 of 5 rows; ask for fewer fields or use offset"}');
});
test("הכול נכנס ← בלי note; שדה חסר לא מופיע", () => {
  const r = JSON.parse(pickFields([{ id: 1, a: null }, { id: 2 }], ["id", "a", "nope"], { maxRows: 10 }));
  assert.deepEqual(r, { rows: [{ id: 1, a: null }, { id: 2 }], total: 2, omitted: 0 });
  assert.equal(pickFields([], ["id"], { maxRows: 3 }), '{"rows":[],"total":0,"omitted":0}');
  assert.deepEqual(JSON.parse(pickFields([{ id: 1 }], ["toString", "id"], { maxRows: 1 })).rows, [{ id: 1 }], "toString אינו שדה של השורה");
});
test("maxRows לא תקין", () => {
  for (const m of [0, -1, 1.5, NaN]) assert.throws(() => pickFields(rows, ["id"], { maxRows: m }), RangeError, String(m));
});
