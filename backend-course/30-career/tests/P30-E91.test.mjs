import { test } from "node:test";
import assert from "node:assert/strict";
import { assertSameRows } from "../../tools/rows.mjs";
import { sandbox } from "../../tools/sql.mjs";

test("P30-E91: הלקוח המוביל בכל עיר", async (t) => {
  const db = await sandbox(t, import.meta.url, "sales.sql");
  const got = await db.fileRows("P30-E91.sql");
  assert.deepEqual(Object.keys(got[0] ?? {}), ["city", "name", "revenue", "share_pct"], "שמות העמודות והסדר שלהן");
  assertSameRows(got, [
    { city: "Beer Sheva", name: "Omer", revenue: 303.8, share_pct: 100 },
    { city: "Haifa", name: "Dana", revenue: 332.9, share_pct: 56.3 },
    { city: "Jerusalem", name: "Eli", revenue: 229, share_pct: 85.4 },
    { city: "Tel Aviv", name: "Noa", revenue: 649, share_pct: 70 },
  ]);
  assertSameRows(got, await db.expectedRows("P30-E91.sql"));
});
test("P30-E91: תיקו ← id קטן; הזמנה מבוטלת לא נספרת", async (t) => {
  const db = await sandbox(t, import.meta.url, "sales.sql");
  await db.query("INSERT INTO orders (customer_id, total, status, created_at) VALUES (1, 316.90, 'paid', '2026-06-30 10:00+03'), (5, 5000, 'cancelled', '2026-06-30 10:00+03')");
  // הזמנה מבוטלת של 5,000 ל־Maya לא משנה את חיפה. ועכשיו תיקו בתל אביב: Yossi ‏238.90 + 410.10 = 649 = Noa
  await db.query("INSERT INTO orders (customer_id, total, status, created_at) VALUES (2, 410.10, 'paid', '2026-06-30 11:00+03')");
  const got = await db.fileRows("P30-E91.sql");
  const telAviv = got.find((r) => r.city === "Tel Aviv");
  assert.equal(telAviv.name, "Yossi", "Yossi (id 2) ו־Noa (id 3) בתיקו של 649 — הקטן");
  assert.equal(got.find((r) => r.city === "Haifa").name, "Dana");
  assert.equal(got.length, 4);
});
