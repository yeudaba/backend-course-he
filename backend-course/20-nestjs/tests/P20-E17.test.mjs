import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { ConfigModule, ENV, CONFIG } = loadNest(import.meta.url, "P20-E17.ts");

test("הגדרות מ־ENV", async (t) => {
  const { call, moduleRef } = await nestApp(t, ConfigModule, { overrides: [[ENV, { APP_NAME: "demo", PORT: "8080", DEBUG: "true" }]] });
  assert.deepEqual((await call("GET", "/info")).body, { name: "demo", port: 8080, debug: true });
  assert.deepEqual(moduleRef.get(CONFIG), { APP_NAME: "demo", PORT: 8080, DEBUG: true });
});
test("ברירות מחדל", async (t) => {
  const { call } = await nestApp(t, ConfigModule, { overrides: [[ENV, { APP_NAME: "x" }]] });
  assert.deepEqual((await call("GET", "/info")).body, { name: "x", port: 3000, debug: false });
});
test("הגדרות לא תקינות ← האפליקציה לא עולה", async (t) => {
  for (const env of [{ PORT: "3000" }, { APP_NAME: "x", PORT: "abc" }, { APP_NAME: "x", PORT: "70000" }, { APP_NAME: "x", DEBUG: "yes" }]) {
    await assert.rejects(nestApp(t, ConfigModule, { overrides: [[ENV, env]] }), /הגדרות לא תקינות/, JSON.stringify(env));
  }
});
