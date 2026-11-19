import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";
import { withTimeout } from "./_helpers.mjs";

const { bookSeat } = await load(import.meta.url, "P18-E14.ts");

const STUCK = (sec) => `bookSeat לא חזרה תוך ${sec} שניות — כנראה חיבור לא שוחרר, וה־pool נגמר. client.release() צריך להיות ב־finally (גם כשנזרקת שגיאה)`;
const book = (pool, eventId, userId, sec = 2) => withTimeout(bookSeat(pool, eventId, userId), sec * 1000, STUCK(sec));

// pool שמשהה כל SELECT ב־15ms: כך כל ההרשמות "קוראות" באותו זמן — בלי נעילה (FOR UPDATE), יותר מ־5 נכנסות בוודאות
function slowSelects(pool) {
  const slow = (q) => async (...args) => {
    const res = await q(...args);
    if (/^\s*select/i.test(typeof args[0] === "string" ? args[0] : args[0]?.text ?? "")) await new Promise((r) => setTimeout(r, 15));
    return res;
  };
  return {
    query: slow(pool.query.bind(pool)),
    connect: async () => {
      const c = await pool.connect();
      c.query = slow(c.query.bind(c));
      return c;
    },
    get idleCount() { return pool.idleCount; },
    get totalCount() { return pool.totalCount; },
  };
}

test("הרשמות ושגיאות", { timeout: 20_000 }, async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  assert.equal(await book(pool, 2, 101), 1);
  assert.equal(await book(pool, 2, 102), 0);
  await assert.rejects(book(pool, 2, 103), (e) => e.code === "SOLD_OUT");
  await assert.rejects(book(pool, 2, 101), (e) => e.code === "ALREADY_BOOKED", "רשום שמנסה שוב — 'כבר רשום', גם כשמלא");
  await assert.rejects(book(pool, 99, 1), (e) => e.code === "EVENT_NOT_FOUND");
  // שלוש שגיאות ברצף, ו־pool של 3 חיבורים: אם חיבור לא משתחרר אחרי שגיאה, הקריאה הבאה תיתקע
  await assert.rejects(book(pool, 99, 2), (e) => e.code === "EVENT_NOT_FOUND", STUCK(2));
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM bookings"))[0].n, 2);
  assert.equal(pool.idleCount, pool.totalCount, "החיבורים שוחררו");
});
test("20 משתמשים, 5 מקומות", { timeout: 20_000 }, async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = slowSelects(db.pool(10));
  const results = await Promise.allSettled(Array.from({ length: 20 }, (_, i) => book(pool, 1, 200 + i, 4)));
  const ok = results.filter((r) => r.status === "fulfilled").length;
  assert.equal(ok, 5, `נרשמו ${ok} מתוך 5 מקומות — כמה הרשמות קראו את הספירה באותו זמן. נעל את שורת האירוע (SELECT ... FOR UPDATE) לפני הספירה`);
  const other = results.filter((r) => r.status === "rejected" && r.reason.code !== "SOLD_OUT");
  assert.equal(other.length, 0, `שגיאות שאינן SOLD_OUT: ${other.map((r) => r.reason.code ?? r.reason.message).join(", ")}`);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM bookings WHERE event_id = 1"))[0].n, 5);
});
