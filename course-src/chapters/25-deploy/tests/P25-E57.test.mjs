import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E57.ts", ["resolveFileEnv"])).resolveFileEnv;
const files = { "/run/secrets/jwt": "super-secret-value-0123456789abcdef\n", "/run/secrets/db": "postgresql://u:p@db/app\r\n\r\n", "/run/secrets/plain": "x" };
const readFile = (p) => {
  if (!(p in files)) throw new Error(`ENOENT: no such file or directory, open '${p}'`);
  return files[p];
};

test("NAME_FILE ← NAME", async () => {
  const f = await get();
  const env = { JWT_SECRET_FILE: "/run/secrets/jwt", DATABASE_URL_FILE: "/run/secrets/db", PORT: "3000", A_FILE: "/run/secrets/plain" };
  const copy = { ...env };
  assert.deepEqual(f(env, readFile), { JWT_SECRET: "super-secret-value-0123456789abcdef", DATABASE_URL: "postgresql://u:p@db/app", PORT: "3000", A: "x" });
  assert.deepEqual(env, copy, "את env לא משנים");
});
test("ערך ריק ל־_FILE ← מתעלמים", async () => {
  const f = await get();
  assert.deepEqual(f({ X_FILE: "", Y: "1" }, readFile), { X_FILE: "", Y: "1" });
});
test("שניהם מוגדרים", async () => {
  const f = await get();
  assert.throws(() => f({ JWT_SECRET: "a", JWT_SECRET_FILE: "/run/secrets/jwt" }, readFile), { message: "JWT_SECRET ו־JWT_SECRET_FILE מוגדרים שניהם" });
});
test("קובץ שלא נקרא — בלי לחשוף נתיב", async () => {
  const f = await get();
  let err;
  try { f({ DB_PASSWORD_FILE: "/run/secrets/missing-db-password" }, readFile); } catch (e) { err = e; }
  assert.equal(err?.message, "לא ניתן לקרוא את DB_PASSWORD_FILE");
});
