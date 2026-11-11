import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sandbox } from "../../tools/sql.mjs";

const solution = () => fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "solutions", "P16-E28.sql"), "utf8");

test("P16-E28: התוצאה (עמודות, שורות וסדר)", async (t) => {
  const db = await sandbox(t, import.meta.url, "shop.sql");
  const got = await db.fileRows("P16-E28.sql");
  const expected = await db.expectedRows("P16-E28.sql");
  assert.deepEqual(Object.keys(got?.[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן (full_name, region, contact)");
  assert.deepEqual(got.map((r) => r.region), expected.map((r) => r.region), "האזורים לפי הסדר center, north, jerusalem, south, unknown — לא לפי א״ב (ולקוח בלי עיר ← 'unknown')");
  assert.deepEqual(got, expected);
});
test("P16-E28: עובד גם על נתונים אחרים (עיר שלא ברשימה, Ramat Gan)", async (t) => {
  const db = await sandbox(t, import.meta.url, "shop.sql");
  await db.query("INSERT INTO customers (full_name, email, city, phone, joined_on) VALUES ('Aaron Eilat', 'aaron@example.com', 'Eilat', NULL, '2026-10-01'), ('Zohar Gan', 'zohar@example.com', 'Ramat Gan', '050-0000000', '2026-10-02'), ('Adi South', 'adi@example.com', 'Beer Sheva', NULL, '2026-10-03')");
  const got = await db.fileRows("P16-E28.sql");
  const expected = (await db.query(solution())).rows;
  const eilat = got.find((r) => r.full_name === "Aaron Eilat");
  assert.equal(eilat?.region, "unknown", "עיר שלא ברשימה ← 'unknown' (ELSE)");
  assert.equal(eilat?.contact, "aaron@example.com", "אין טלפון ← האימייל");
  assert.deepEqual(got, expected);
});
