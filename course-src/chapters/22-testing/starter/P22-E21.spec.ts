// P22-E21: הבדיקות "עוברות" — אבל הן חלשות מדי: כמעט כל באג עובר דרכן. חזק אותן
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseConfig } from "./P22-E21.ts";

test("הגדרות תקינות", () => {
  const config = parseConfig({ APP_NAME: "tasks", PORT: "8080", DEBUG: "false", CORS_ORIGINS: "http://a.com, http://b.com" });
  assert.ok(config);
  assert.ok(config.port);
  assert.ok(config.allowedOrigins.length > 0);
});

test("ברירות מחדל", () => {
  const config = parseConfig({ APP_NAME: "tasks" });
  assert.ok(config.port > 0);
  assert.equal(typeof config.debug, "boolean");
});

test("בלי APP_NAME — שגיאה", () => {
  assert.throws(() => parseConfig({}));
});
