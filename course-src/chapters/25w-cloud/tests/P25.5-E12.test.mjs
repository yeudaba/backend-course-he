import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { loadConfig } = await load(import.meta.url, "P25.5-E12.ts");
const files = {
  "/var/run/secrets/coffee/database-url": "postgresql://app:s3cret@db:5432/shop\n",
  "/var/run/secrets/coffee/jwt-secret": "x".repeat(40) + "\n",
  "/var/run/secrets/coffee/empty": "",
};
const readFile = (p) => {
  if (!(p in files)) throw Object.assign(new Error(`ENOENT: ${p}`), { code: "ENOENT" });
  return files[p];
};
const base = { DATABASE_URL: "postgresql://localhost/shop", JWT_SECRET: "dev-secret", REDIS_URL: "redis://localhost:6379" };

test("ישירות מ־env (פיתוח)", () => {
  assert.deepEqual(loadConfig(base, readFile), { databaseUrl: base.DATABASE_URL, jwtSecret: "dev-secret", redisUrl: base.REDIS_URL, port: 3000 });
});
test("*_FILE: קורא מהקובץ, בלי ה־newline שבסוף", () => {
  const env = { DATABASE_URL_FILE: "/var/run/secrets/coffee/database-url", JWT_SECRET_FILE: "/var/run/secrets/coffee/jwt-secret", REDIS_URL: "redis://r:6379", PORT: "8080" };
  const c = loadConfig(env, readFile);
  assert.equal(c.databaseUrl, "postgresql://app:s3cret@db:5432/shop");
  assert.equal(c.jwtSecret, "x".repeat(40));
  assert.equal(c.port, 8080);
});
test("שניהם מוגדרים ← שגיאה (מי מנצח? אף אחד — זו טעות בתצורה)", () => {
  assert.throws(() => loadConfig({ ...base, JWT_SECRET_FILE: "/var/run/secrets/coffee/jwt-secret" }, readFile), /JWT_SECRET/);
});
test("קובץ חסר או ריק ← שגיאה עם שם ההגדרה", () => {
  assert.throws(() => loadConfig({ ...base, DATABASE_URL: undefined, DATABASE_URL_FILE: "/nope" }, readFile), /DATABASE_URL_FILE/);
  assert.throws(() => loadConfig({ ...base, DATABASE_URL: undefined, DATABASE_URL_FILE: "/var/run/secrets/coffee/empty" }, readFile), /DATABASE_URL_FILE/);
});
test("חסרות כמה ← שגיאה אחת שמונה את כולן", () => {
  assert.throws(() => loadConfig({ REDIS_URL: "redis://x" }, readFile), (err) => /DATABASE_URL/.test(err.message) && /JWT_SECRET/.test(err.message));
  assert.throws(() => loadConfig({ ...base, JWT_SECRET: "" }, readFile), /JWT_SECRET/, "מחרוזת ריקה = חסר");
});
test("PORT לא תקין", () => {
  assert.throws(() => loadConfig({ ...base, PORT: "abc" }, readFile), /PORT/);
  assert.throws(() => loadConfig({ ...base, PORT: "70000" }, readFile), /PORT/);
});
