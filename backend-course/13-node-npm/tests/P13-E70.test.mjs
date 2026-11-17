import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E70.mjs", ["parseEnv"])).parseEnv;
const schema = {
  PORT: { type: "int", default: 3000 },
  DATABASE_URL: { type: "string" },
  DEBUG: { type: "bool", default: false },
  LOG_LEVEL: { type: "enum", values: ["debug", "info", "error"], default: "info" },
};

test("ערכים, ברירות מחדל ו־camelCase", async () => {
  const parseEnv = await get();
  assert.deepEqual(parseEnv({ DATABASE_URL: " postgres://x ", DEBUG: "TRUE" }, schema), { port: 3000, databaseUrl: "postgres://x", debug: true, logLevel: "info" });
  assert.deepEqual(parseEnv({ PORT: "-1", DATABASE_URL: "a", DEBUG: "0", LOG_LEVEL: "error" }, schema), { port: -1, databaseUrl: "a", debug: false, logLevel: "error" });
  assert.deepEqual(parseEnv({ MAX_UPLOAD_MB: "5" }, { MAX_UPLOAD_MB: { type: "int" }, A_B_2: { type: "string", default: "x" } }), { maxUploadMb: 5, aB2: "x" });
});
test("כל הבעיות יחד, לפי סדר הסכמה", async () => {
  const parseEnv = await get();
  assert.throws(() => parseEnv({ PORT: "80a", LOG_LEVEL: "verbose", DEBUG: "yes" }, schema), { message: "הגדרות לא תקינות:\nPORT: לא תקין\nDATABASE_URL: חסר\nDEBUG: לא תקין\nLOG_LEVEL: לא תקין" });
  assert.throws(() => parseEnv({ PORT: "1e3", DATABASE_URL: "  " }, schema), { message: "הגדרות לא תקינות:\nPORT: לא תקין\nDATABASE_URL: חסר" });
  assert.throws(() => parseEnv({ DATABASE_URL: "x", LOG_LEVEL: "INFO" }, schema), { message: "הגדרות לא תקינות:\nLOG_LEVEL: לא תקין" }, "enum רגיש לאותיות");
});
test("סוג לא מוכר — מיד, גם כשהמשתנה חסר", async () => {
  const parseEnv = await get();
  assert.throws(() => parseEnv({ X: "1" }, { X: { type: "float" } }), { message: "סוג לא מוכר: float" });
  assert.throws(() => parseEnv({}, { X: { type: "date", default: "x" } }), { message: "סוג לא מוכר: date" });
});
