import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E103.ts", ["prodEnvProblems"])).prodEnvProblems;
const GOOD = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://u:p@ep-x.neon.tech/db?sslmode=require",
  JWT_SECRET: "x".repeat(32),
  CORS_ORIGINS: "https://app.example.com,https://www.example.com",
};
const n = (f, over) => f({ ...GOOD, ...over }).length;

test("הגדרות תקינות ← אין בעיות", async () => {
  const f = await get();
  assert.deepEqual(f(GOOD), []);
});
test("sslmode חייב להיות require", async () => {
  const f = await get();
  assert.equal(n(f, { DATABASE_URL: "postgresql://u:p@h/db?sslmode=disable" }), 1, "sslmode=disable עבר");
  assert.equal(n(f, { DATABASE_URL: "postgresql://u:p@h/db" }), 1);
  assert.equal(n(f, { DATABASE_URL: undefined }), 1);
});
test("JWT_SECRET: לפחות 32 תווים", async () => {
  const f = await get();
  assert.equal(n(f, { JWT_SECRET: "x".repeat(31) }), 1, "סוד של 31 תווים עבר");
  assert.equal(n(f, { JWT_SECRET: "x".repeat(32) }), 0, "32 תווים — מותר");
  assert.equal(n(f, { JWT_SECRET: "change-me" }), 1);
});
test("CORS_ORIGINS בלי * בשום מקום", async () => {
  const f = await get();
  assert.equal(n(f, { CORS_ORIGINS: "https://app.example.com,*" }), 1, "* בסוף הרשימה עבר");
  assert.equal(n(f, { CORS_ORIGINS: "*" }), 1);
  assert.equal(n(f, { CORS_ORIGINS: "" }), 1);
});
test("כמה בעיות יחד, ו־NODE_ENV", async () => {
  const f = await get();
  assert.equal(f({ NODE_ENV: "development", JWT_SECRET: "short", CORS_ORIGINS: "*" }).length, 4);
});
