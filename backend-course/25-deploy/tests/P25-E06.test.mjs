import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { loadConfig } = await load(import.meta.url, "P25-E06.ts");
const PROD = { NODE_ENV: "production", DATABASE_URL: "postgresql://u:p@db.example.com/app", JWT_SECRET: "s".repeat(40) };

test("פיתוח: ברירות מחדל", () => {
  assert.deepEqual(loadConfig({}), { env: "development", port: 3000, databaseUrl: "postgresql://postgres@localhost:5432/dev", jwtSecret: "dev-only-secret-not-for-production!!", logLevel: "info" });
});
test("פרודקשן תקין", () => {
  assert.deepEqual(loadConfig({ ...PROD, PORT: "10000", LOG_LEVEL: "warn" }), { env: "production", port: 10000, databaseUrl: PROD.DATABASE_URL, jwtSecret: PROD.JWT_SECRET, logLevel: "warn" });
});
test("פרודקשן: כל הבעיות בהודעה אחת", () => {
  assert.throws(() => loadConfig({ NODE_ENV: "production", JWT_SECRET: "short", LOG_LEVEL: "debug" }), (err) => {
    for (const key of ["DATABASE_URL", "JWT_SECRET", "LOG_LEVEL"]) assert.match(err.message, new RegExp(key), `ההודעה מזכירה את ${key}`);
    return true;
  });
});
test("פרודקשן: בלי JWT_SECRET — לא נופלים לברירת המחדל של פיתוח", () => {
  assert.throws(() => loadConfig({ NODE_ENV: "production", DATABASE_URL: PROD.DATABASE_URL }), /JWT_SECRET/);
});
test("ערכים לא תקינים — בכל סביבה", () => {
  assert.throws(() => loadConfig({ PORT: "abc" }), /PORT/);
  assert.throws(() => loadConfig({ PORT: "70000" }), /PORT/);
  assert.throws(() => loadConfig({ NODE_ENV: "prod" }), /NODE_ENV/);
  assert.throws(() => loadConfig({ LOG_LEVEL: "verbose" }), /LOG_LEVEL/);
});
