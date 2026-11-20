import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const { dailyReport, markShipped, dayParam } = await load(import.meta.url, "P25.5-E21.ts");

async function conn(t) {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const c = await mysql.createConnection(db.url);
  t.after(() => c.end());
  return { db, c };
}
test("סכום כסף — מספר, לא שרשור מחרוזות", async (t) => {
  const { c } = await conn(t);
  assert.deepEqual(await dailyReport(c, dayParam("2026-03-04")), { day: "2026-03-04", orders: 1, totalCents: 23800 });
  assert.deepEqual(await dailyReport(c, dayParam("2026-03-01")), { day: "2026-03-01", orders: 1, totalCents: 27890 });
});
test("markShipped: הזמנה שכבר נשלחה — עדיין true; מבוטלת — false", async (t) => {
  const { c } = await conn(t);
  assert.equal(await markShipped(c, 1), true);
  assert.equal(await markShipped(c, 1), true, "ערך זהה — affectedRows 1, changedRows 0");
  assert.equal(await markShipped(c, 3), false);
});
test("dayParam: מחרוזת, לא Date", () => {
  assert.equal(dayParam("2026-03-01"), "2026-03-01");
  assert.throws(() => dayParam("1/3/2026"));
});
test("גבולות היום: 00:00 בפנים, 00:00 של מחר בחוץ", async (t) => {
  const { db, c } = await conn(t);
  await db.query("INSERT INTO orders (customer_id, status, total, created_at) VALUES (1, 'paid', 10.00, '2026-03-04 00:00:00'), (1, 'paid', 20.00, '2026-03-05 00:00:00')");
  assert.deepEqual(await dailyReport(c, dayParam("2026-03-04")), { day: "2026-03-04", orders: 2, totalCents: 24800 });
});
