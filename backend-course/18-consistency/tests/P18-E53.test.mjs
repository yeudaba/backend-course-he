import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";
import { withTimeout } from "./_helpers.mjs";

const FILE = "P18-E53.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["redeem"])).redeem;
const TABLES = `CREATE TABLE coupons (code text PRIMARY KEY, uses_left integer NOT NULL CHECK (uses_left >= 0));
CREATE TABLE coupon_redemptions (code text NOT NULL REFERENCES coupons (code), user_id integer NOT NULL, PRIMARY KEY (code, user_id));
INSERT INTO coupons VALUES ('WELCOME', 5), ('LAST', 1), ('EMPTY', 0);`;
async function setup(t, max = 10) {
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLES);
  return { db, pool: db.pool(max) };
}
const left = async (db, code) => (await db.rows("SELECT uses_left FROM coupons WHERE code = $1", [code]))[0].uses_left;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("מימוש ושגיאות", async (t) => {
  const redeem = await get();
  const { db, pool } = await setup(t, 3);
  assert.equal(await redeem(pool, "WELCOME", 1), 4);
  assert.equal(await redeem(pool, "WELCOME", 2), 3);
  await assert.rejects(redeem(pool, "WELCOME", 1), (e) => e.code === "ALREADY_REDEEMED");
  assert.equal(await left(db, "WELCOME"), 3, "ה־ROLLBACK החזיר את המימוש");
  await assert.rejects(redeem(pool, "NOPE", 1), (e) => e.code === "COUPON_NOT_FOUND");
  await assert.rejects(redeem(pool, "EMPTY", 1), (e) => e.code === "COUPON_EXHAUSTED");
  assert.equal(await redeem(pool, "LAST", 9), 0);
  await assert.rejects(redeem(pool, "LAST", 10), (e) => e.code === "COUPON_EXHAUSTED");
  await withTimeout((async () => {
    for (let i = 0; i < 8; i++) await redeem(pool, "EMPTY", i).catch(() => {});
  })(), 6000, "נתקע — חיבור לא שוחרר אחרי שגיאה");
});
test("20 משתמשים במקביל על 5 מימושים", async (t) => {
  const redeem = await get();
  const { db, pool } = await setup(t);
  const results = await Promise.allSettled(Array.from({ length: 20 }, (_, i) => redeem(pool, "WELCOME", 100 + i)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 5);
  assert.ok(results.filter((r) => r.status === "rejected").every((r) => r.reason.code === "COUPON_EXHAUSTED"));
  assert.equal(await left(db, "WELCOME"), 0);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM coupon_redemptions"))[0].n, 5);
});
test("אותו משתמש 6 פעמים במקביל", async (t) => {
  const redeem = await get();
  const { db, pool } = await setup(t);
  const results = await Promise.allSettled(Array.from({ length: 6 }, () => redeem(pool, "WELCOME", 7)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.ok(results.filter((r) => r.status === "rejected").every((r) => r.reason.code === "ALREADY_REDEEMED"));
  assert.equal(await left(db, "WELCOME"), 4, "רק מימוש אחד ירד");
});
