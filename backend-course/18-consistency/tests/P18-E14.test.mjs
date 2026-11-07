import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";

const { bookSeat } = await load(import.meta.url, "P18-E14.ts");

test("הרשמות ושגיאות", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  assert.equal(await bookSeat(pool, 2, 101), 1);
  assert.equal(await bookSeat(pool, 2, 102), 0);
  await assert.rejects(bookSeat(pool, 2, 103), (e) => e.code === "SOLD_OUT");
  await assert.rejects(bookSeat(pool, 2, 101), (e) => e.code === "ALREADY_BOOKED", "רשום שמנסה שוב — 'כבר רשום', גם כשמלא");
  await assert.rejects(bookSeat(pool, 99, 1), (e) => e.code === "EVENT_NOT_FOUND");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM bookings"))[0].n, 2);
  assert.equal(pool.idleCount, pool.totalCount, "החיבורים שוחררו");
});
test("20 משתמשים, 5 מקומות", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(10);
  const results = await Promise.allSettled(Array.from({ length: 20 }, (_, i) => bookSeat(pool, 1, 200 + i)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 5);
  assert.ok(results.filter((r) => r.status === "rejected").every((r) => r.reason.code === "SOLD_OUT"));
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM bookings WHERE event_id = 1"))[0].n, 5);
});
