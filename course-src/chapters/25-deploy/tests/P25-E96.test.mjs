import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E96.ts", ["renderEnvProblems"])).renderEnvProblems;
const GOOD = {
  DATABASE_URL: "postgresql://u:p@ep.neon.tech/neondb?sslmode=require&channel_binding=require",
  JWT_SECRET: "k2Jd8sLq0pWz7xYvB4nMk2Jd8sLq0pWz",
  CORS_ORIGINS: "https://tasks-web.onrender.com, https://dana.dev",
  TRUST_PROXY: "1",
};
const names = (list) => list.map((p) => p.split(":")[0]);

test("תקין", async () => {
  const f = await get();
  assert.deepEqual(f(GOOD), []);
  assert.deepEqual(f({ ...GOOD, NODE_ENV: "production" }), []);
});
test("כל הבעיות, בסדר", async () => {
  const f = await get();
  const r = f({ PORT: "3000", NODE_ENV: "development", RENDER_GIT_COMMIT: "abc", TRUST_PROXY: "true" });
  assert.deepEqual(names(r), ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGINS", "TRUST_PROXY", "PORT", "NODE_ENV", "RENDER_GIT_COMMIT"]);
  assert.ok(r.every((p) => /^[A-Z_]+: \S/.test(p)), "כל שורה: NAME: הסבר");
});
test("ערכים לא תקינים", async () => {
  const f = await get();
  assert.deepEqual(names(f({ ...GOOD, DATABASE_URL: "postgresql://u:p@h/db" })), ["DATABASE_URL"]);
  assert.deepEqual(names(f({ ...GOOD, DATABASE_URL: "postgresql://u:p@h/db?sslmode=required" })), ["DATABASE_URL"]);
  assert.deepEqual(names(f({ ...GOOD, JWT_SECRET: "x".repeat(31) })), ["JWT_SECRET"]);
  assert.deepEqual(names(f({ ...GOOD, CORS_ORIGINS: "https://a.com,http://b.com" })), ["CORS_ORIGINS"]);
  assert.deepEqual(names(f({ ...GOOD, CORS_ORIGINS: "https://a.com/" })), ["CORS_ORIGINS"]);
  assert.deepEqual(names(f({ ...GOOD, TRUST_PROXY: "2" })), ["TRUST_PROXY"]);
  assert.deepEqual(names(f({ ...GOOD, PORT: "" })), ["PORT"], "גם ריק");
});
