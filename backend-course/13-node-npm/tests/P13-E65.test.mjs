import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P13-E65.mjs", ["deepFreeze", "buildConfig"]);
const DB = "postgres://localhost/shop";

test("deepFreeze", async () => {
  const { deepFreeze } = await get();
  const o = { a: { b: { c: 1 } }, list: [{ x: 1 }], n: null, s: "x" };
  assert.equal(deepFreeze(o), o, "מחזירה את אותו אובייקט");
  assert.ok(Object.isFrozen(o) && Object.isFrozen(o.a) && Object.isFrozen(o.a.b) && Object.isFrozen(o.list) && Object.isFrozen(o.list[0]), "כל הרמות צריכות להיות קפואות");
});
test("buildConfig — ברירות מחדל", async () => {
  const { buildConfig } = await get();
  const c = buildConfig({ DATABASE_URL: ` ${DB} ` });
  assert.deepEqual(c, { server: { port: 3000, host: "0.0.0.0" }, db: { url: DB, poolSize: 10 }, admins: [] });
  assert.ok(Object.isFrozen(c) && Object.isFrozen(c.server) && Object.isFrozen(c.db) && Object.isFrozen(c.admins), "התוצאה צריכה להיות קפואה לגמרי");
});
test("buildConfig — ערכים מלאים", async () => {
  const { buildConfig } = await get();
  assert.deepEqual(buildConfig({ PORT: "8080", HOST: "127.0.0.1", DATABASE_URL: DB, DB_POOL_SIZE: "100", ADMIN_EMAILS: "Dana@x.com, ,omer@x.com," }), {
    server: { port: 8080, host: "127.0.0.1" },
    db: { url: DB, poolSize: 100 },
    admins: ["dana@x.com", "omer@x.com"],
  });
});
test("כל הבעיות יחד, לפי הסדר", async () => {
  const { buildConfig } = await get();
  assert.throws(() => buildConfig({ PORT: "99999", DB_POOL_SIZE: "abc" }), { message: "הגדרות לא תקינות: PORT, DATABASE_URL, DB_POOL_SIZE" });
  assert.throws(() => buildConfig({ PORT: "0", HOST: "  ", DATABASE_URL: "  ", DB_POOL_SIZE: "0" }), { message: "הגדרות לא תקינות: PORT, HOST, DATABASE_URL, DB_POOL_SIZE" });
  assert.throws(() => buildConfig({ DATABASE_URL: DB, DB_POOL_SIZE: "101" }), { message: "הגדרות לא תקינות: DB_POOL_SIZE" });
  assert.throws(() => buildConfig({ DATABASE_URL: DB, PORT: "80.5" }), { message: "הגדרות לא תקינות: PORT" });
});
