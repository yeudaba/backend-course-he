// P22-E21 — מחוזק
import { test } from "node:test";
import assert from "node:assert/strict";
import { ConfigError, parseConfig } from "./P22-E21.ts";

test("הגדרות תקינות — כל השדות, בערכים המדויקים", () => {
  const config = parseConfig({ APP_NAME: " tasks ", PORT: "8080", DEBUG: "false", CORS_ORIGINS: "http://a.com, http://b.com" });
  assert.deepEqual(config, { port: 8080, debug: false, appName: "tasks", allowedOrigins: ["http://a.com", "http://b.com"] });
});

test("ברירות מחדל — מדויקות", () => {
  assert.deepEqual(parseConfig({ APP_NAME: "tasks" }), { port: 3000, debug: false, appName: "tasks", allowedOrigins: [] });
  assert.equal(parseConfig({ APP_NAME: "tasks", DEBUG: "true" }).debug, true);
});

test("שגיאות — הסוג וההודעה", () => {
  assert.throws(() => parseConfig({}), { message: "APP_NAME חובה" });
  assert.throws(() => parseConfig({}), ConfigError);
  for (const PORT of ["0", "65536", "abc", "3.5"]) {
    assert.throws(() => parseConfig({ APP_NAME: "x", PORT }), ConfigError, PORT);
  }
  assert.equal(parseConfig({ APP_NAME: "x", PORT: "65535" }).port, 65535);
  assert.throws(() => parseConfig({ APP_NAME: "x", DEBUG: "yes" }), ConfigError);
});
