import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("הנחה רק לנכונים", async (t) => {
  const db = await sandbox(t, import.meta.url, "shop.sql");
  const returned = await db.fileRows("P16-E22.sql");
  assert.deepEqual(returned.map((r) => r.name).sort(), ["Grinder Cleaning Brush", "Paper Filters (100)"]);
  const prices = Object.fromEntries((await db.rows("SELECT name, price FROM products")).map((r) => [r.name, r.price]));
  assert.equal(prices["Paper Filters (100)"], 19.92);
  assert.equal(prices["Grinder Cleaning Brush"], 15.92);
  assert.equal(prices["Ceramic Mug"], 39, "אביזר של 39 — לא בהנחה");
  assert.equal(prices["Brazil Beans 250g"], 29.9, "לא אביזר — לא בהנחה");
});
