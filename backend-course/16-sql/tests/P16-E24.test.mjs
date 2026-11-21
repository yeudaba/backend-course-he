import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

// שורה תקינה — המסד חייב לקבל אותה
async function ok(db, sql) {
  try {
    await db.query(sql);
  } catch (err) {
    assert.fail(`המסד סירב לשורה תקינה: ${err.message}\nהפקודה: ${sql}`);
  }
}
// שורה שעוברת על חוק — המסד חייב לסרב לה (אילוץ CHECK / UNIQUE / NOT NULL)
async function bad(db, sql, what) {
  let accepted = false;
  try {
    await db.query(sql);
    accepted = true;
  } catch {
    // סירב — כמו שצריך
  }
  if (accepted) assert.fail(`המסד קיבל ${what} — ציפינו שיסרב. חסר אילוץ (CHECK, ‏UNIQUE או NOT NULL) שאוכף את החוק הזה.\nהפקודה: ${sql}`);
}
const insert = (cols, vals) => `INSERT INTO coupons (${cols}) VALUES (${vals})`;

test("קופונים", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.runFile("P16-E24.sql");
  const C = "code, percent_off, amount_off, valid_from, valid_until, max_uses, uses";
  await ok(db, insert(C, "'WELCOME10', 10, NULL, '2026-01-01', '2026-12-31', NULL, 0"));
  await ok(db, insert(C, "'FIXED50', NULL, 50, '2026-01-01', '2026-01-02', 100, 100"));
  const [row] = await db.rows("INSERT INTO coupons (code, percent_off, valid_from, valid_until) VALUES ('SALE2026', 90, '2026-11-01', '2026-11-30') RETURNING id, uses, max_uses");
  assert.deepEqual(row, { id: 3, uses: 0, max_uses: null });

  await bad(db, insert(C, "'WELCOME10', 5, NULL, '2026-01-01', '2026-12-31', NULL, 0"), "code כפול");
  await bad(db, insert(C, "'welcome', 5, NULL, '2026-01-01', '2026-12-31', NULL, 0"), "code באותיות קטנות");
  await bad(db, insert(C, "'ABC', 5, NULL, '2026-01-01', '2026-12-31', NULL, 0"), "code של 3 תווים");
  await bad(db, insert(C, "'ABCDEFGHIJKLMNOPQRSTU', 5, NULL, '2026-01-01', '2026-12-31', NULL, 0"), "code של 21 תווים");
  await bad(db, insert(C, "'SAVE-10', 5, NULL, '2026-01-01', '2026-12-31', NULL, 0"), "code עם מקף");
  await bad(db, insert(C, "'BOTH10', 10, 10, '2026-01-01', '2026-12-31', NULL, 0"), "גם אחוז וגם סכום");
  await bad(db, insert(C, "'NONE10', NULL, NULL, '2026-01-01', '2026-12-31', NULL, 0"), "בלי הנחה בכלל");
  await bad(db, insert(C, "'PCT91', 91, NULL, '2026-01-01', '2026-12-31', NULL, 0"), "91%");
  await bad(db, insert(C, "'PCT0', 0, NULL, '2026-01-01', '2026-12-31', NULL, 0"), "0%");
  await bad(db, insert(C, "'AMT0', NULL, 0, '2026-01-01', '2026-12-31', NULL, 0"), "סכום 0");
  await bad(db, insert(C, "'DATES1', 5, NULL, '2026-05-01', '2026-05-01', NULL, 0"), "until = from");
  await bad(db, insert(C, "'USES1', 5, NULL, '2026-01-01', '2026-12-31', 3, 4"), "uses > max_uses");
  await bad(db, insert(C, "'USES2', 5, NULL, '2026-01-01', '2026-12-31', 0, 0"), "max_uses 0");
  await bad(db, insert(C, "'USES3', 5, NULL, '2026-01-01', '2026-12-31', NULL, -1"), "uses שלילי");
  await bad(db, "INSERT INTO coupons (code, percent_off, valid_from) VALUES ('NOEND1', 5, '2026-01-01')", "valid_until חובה");
  await bad(db, "UPDATE coupons SET uses = 101 WHERE code = 'FIXED50'", "uses עובר את max_uses בעדכון");
});
