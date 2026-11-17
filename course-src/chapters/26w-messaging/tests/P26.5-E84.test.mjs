import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { RecentIds } = await load(import.meta.url, "P26.5-E84.ts");

test("חלון של max אחרונים", () => {
  const r = new RecentIds(3);
  assert.deepEqual(["a", "b", "a", "c"].map((x) => r.seen(x)), [false, false, true, false]);
  assert.equal(r.size, 3);
  assert.equal(r.seen("d"), false, "a יוצא");
  assert.equal(r.size, 3);
  assert.equal(r.seen("a"), false, "a כבר לא בחלון");
  assert.equal(r.seen("b"), false, "b יצא אחרי a — seen על a לא ריענן אותו");
  assert.equal(r.seen("d"), true);
});
test("גודל קבוע גם עם 100,000", () => {
  const r = new RecentIds(1000);
  for (let i = 0; i < 100_000; i++) r.seen(`id-${i}`);
  assert.equal(r.size, 1000);
  assert.equal(r.seen("id-99999"), true);
  assert.equal(r.seen("id-98999"), false);
});
