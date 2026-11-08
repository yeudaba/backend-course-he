import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { loadConfig } = await load(import.meta.url, "P25-E21.ts");

test("פיתוח — עדיין נוח", () => {
  assert.deepEqual(loadConfig({}), { production: false, jwtSecret: "dev-secret", debug: false, corsOrigins: ["http://localhost:5500"] });
});
test("פרודקשן בלי סוד — לא עולה", () => {
  assert.throws(() => loadConfig({ NODE_ENV: "production" }), /JWT_SECRET/);
  assert.throws(() => loadConfig({ NODE_ENV: "production", JWT_SECRET: "short" }), /JWT_SECRET/);
  assert.equal(loadConfig({ NODE_ENV: "production", JWT_SECRET: "x".repeat(32) }).production, true);
});
test("DEBUG מה־env", () => {
  assert.equal(loadConfig({ DEBUG: "true" }).debug, true);
  assert.equal(loadConfig({ DEBUG: "1" }).debug, true);
  assert.equal(loadConfig({ DEBUG: "false" }).debug, false);
});
test("CORS_ORIGINS עם רווחים", () => {
  assert.deepEqual(loadConfig({ CORS_ORIGINS: "https://a.example.com, https://b.example.com ," }).corsOrigins, ["https://a.example.com", "https://b.example.com"]);
});
