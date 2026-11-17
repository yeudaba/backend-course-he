import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, code } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E57.ts", ["ordersPerDay"]);

async function pool(t) {
  const db = await sandbox(t, import.meta.url, "orders-tz.sql");
  const p = db.pool(2);
  p.on("connect", (c) => c.query("SET TIME ZONE 'Asia/Jerusalem'").catch(() => {}));
  return p;
}

test("UTC", async (t) => {
  const { ordersPerDay } = await get();
  assert.deepEqual(await ordersPerDay(await pool(t), "UTC"), [
    { day: "2026-03-26", orders: 2, totalCents: 800 },
    { day: "2026-11-04", orders: 3, totalCents: 7000 },
    { day: "2026-11-05", orders: 2, totalCents: 24000 },
  ], "החיבור מוגדר לישראל — ‏created_at::date ייתן תוצאה של ישראל");
});
test("ישראל — כולל שעון קיץ", async (t) => {
  const { ordersPerDay } = await get();
  assert.deepEqual(await ordersPerDay(await pool(t), "Asia/Jerusalem"), [
    { day: "2026-03-26", orders: 1, totalCents: 300 },
    { day: "2026-03-27", orders: 1, totalCents: 500 },
    { day: "2026-11-04", orders: 2, totalCents: 3000 },
    { day: "2026-11-05", orders: 2, totalCents: 12000 },
    { day: "2026-11-06", orders: 1, totalCents: 16000 },
  ]);
});
test("ניו יורק", async (t) => {
  const { ordersPerDay } = await get();
  assert.deepEqual(await ordersPerDay(await pool(t), "America/New_York"), [
    { day: "2026-03-26", orders: 2, totalCents: 800 },
    { day: "2026-11-04", orders: 4, totalCents: 15000 },
    { day: "2026-11-05", orders: 1, totalCents: 16000 },
  ]);
});
test("אזור לא קיים ← שגיאה מהמסד; ובלי שרשור", async (t) => {
  const { ordersPerDay } = await get();
  await assert.rejects(ordersPerDay(await pool(t), "Mars/Olympus"));
  assert.doesNotMatch(code(import.meta.url, "P24-E57.ts"), /\$\{\s*tz\s*\}/, "tz עובר כפרמטר ($1), לא ב־${tz}");
});
