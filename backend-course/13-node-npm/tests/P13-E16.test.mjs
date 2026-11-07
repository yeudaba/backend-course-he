import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { configFor } = await load(import.meta.url, "P13-E16.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("development ברירת מחדל", () => assert.deepEqual(configFor({}), { env: "development", databaseUrl: "postgres://localhost:5432/app_dev", logLevel: "debug", cors: "*" }));
test("test עם דריסה", () => assert.deepEqual(configFor({ NODE_ENV: "test", LOG_LEVEL: "warn" }), { env: "test", databaseUrl: "postgres://localhost:5432/app_test", logLevel: "warn", cors: "*" }));
test("production", () => {
  assert.throws(() => configFor({ NODE_ENV: "production" }), { message: "DATABASE_URL חובה ב־production" });
  assert.throws(() => configFor({ NODE_ENV: "production", DATABASE_URL: "x" }), { message: "CORS_ORIGIN חובה ב־production" });
  assert.deepEqual(configFor({ NODE_ENV: "production", DATABASE_URL: "x", CORS_ORIGIN: "https://a" }), { env: "production", databaseUrl: "x", logLevel: "info", cors: "https://a" });
});
test("לא מוכר", () => assert.throws(() => configFor({ NODE_ENV: "staging" }), { message: "NODE_ENV לא מוכר: staging" }));
