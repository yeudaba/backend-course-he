import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { loadConfig, redact } = await load(import.meta.url, "P13-E15.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

const good = { DATABASE_URL: "postgres://u:p@h/db", JWT_SECRET: "x".repeat(32) };
test("תקין וקפוא", () => { const c = loadConfig({ ...good, PORT: "8080" }); assert.deepEqual(c, { port: 8080, databaseUrl: good.DATABASE_URL, jwtSecret: good.JWT_SECRET, logLevel: "info" }); assert.ok(Object.isFrozen(c)); });
test("כל הבעיות יחד", () => {
  assert.throws(() => loadConfig({ JWT_SECRET: "short" }), { message: "הגדרות לא תקינות: DATABASE_URL חסר; JWT_SECRET קצר מדי" });
  assert.throws(() => loadConfig({ PORT: "x", LOG_LEVEL: "loud" }), { message: "הגדרות לא תקינות: DATABASE_URL חסר; JWT_SECRET חסר; PORT לא תקין; LOG_LEVEL לא תקין" });
});
test("redact", () => assert.deepEqual(redact({ port: 1, databaseUrl: "x", jwtSecret: "y", adminPassword: "z", logLevel: "info" }), { port: 1, databaseUrl: "***", jwtSecret: "***", adminPassword: "***", logLevel: "info" }));
