import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";

async function setup(t) {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.runFile("P25.5-E32.sql");
  const ins = (cols, vals) => db.query(`INSERT INTO promo_codes (${cols}) VALUES (${vals.map(() => "?").join(", ")})`, vals);
  return { db, ins };
}

test("הטבלה קיימת, עם ברירות מחדל", async (t) => {
  const { db, ins } = await setup(t);
  await ins("code, percent", ["WELCOME5", 5]);
  const [row] = await db.rows("SELECT code, percent, uses_left, valid_until, product_id FROM promo_codes WHERE code = 'WELCOME5'");
  assert.deepEqual(row, { code: "WELCOME5", percent: 5, uses_left: 1, valid_until: null, product_id: null });
  await ins("code, percent, valid_until, product_id, uses_left", ["BEANS20", 20, "2026-12-31", 1, 100]);
  const [cols] = await db.query("SELECT COLUMN_NAME, COLLATION_NAME, COLUMN_TYPE, EXTRA FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'promo_codes' AND COLUMN_NAME IN ('id', 'code')");
  const byName = Object.fromEntries(cols.map((c) => [c.COLUMN_NAME, c]));
  assert.match(byName.id.COLUMN_TYPE, /unsigned/, "id UNSIGNED");
  assert.match(byName.id.EXTRA, /auto_increment/);
  assert.match(byName.code.COLLATION_NAME, /^utf8mb4_/, "utf8mb4");
});
test("code — ייחודי ורגיש לרישיות", async (t) => {
  const { ins } = await setup(t);
  await ins("code, percent", ["SAVE10", 10]);
  await ins("code, percent", ["save10", 15]);
  await assert.rejects(ins("code, percent", ["SAVE10", 20]), /Duplicate entry/, "אותו קוד בדיוק — כפול");
  await assert.rejects(ins("code, percent", [null, 20]), "code חובה");
  await assert.rejects(ins("code, percent", ["X".repeat(21), 20]), /too long/i, "עד 20 תווים");
});
test("percent ו־uses_left", async (t) => {
  const { ins } = await setup(t);
  for (const p of [0, 91, -1, 100]) await assert.rejects(ins("code, percent", [`P${p}`, p]), `percent ${p}`);
  await ins("code, percent", ["P1", 1]);
  await ins("code, percent", ["P90", 90]);
  await assert.rejects(ins("code, percent, uses_left", ["NEG", 10, -1]), "uses_left לא שלילי");
  await ins("code, percent, uses_left", ["ZERO", 10, 0]);
  await assert.rejects(ins("code, percent", ["NOP", null]), "percent חובה");
});
test("product_id ו־valid_until", async (t) => {
  const { ins } = await setup(t);
  await assert.rejects(ins("code, percent, product_id", ["GHOST", 10, 999]), /foreign key/i, "מוצר שלא קיים");
  await assert.rejects(ins("code, percent, valid_until", ["BADDATE", 10, "2026-02-30"]), "תאריך לא קיים");
});
