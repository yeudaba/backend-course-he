import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("כל סוגי השגיאות", async (t) => {
  const { ItemsModule } = exportsOf(import.meta.url, "P20-E75.ts", ["ItemsModule", "AllErrorsFilter", "ItemsController"]);
  const { call } = await nestApp(t, ItemsModule);
  assert.deepEqual((await call("GET", "/items/1")).body, { id: 1 });
  const nf = await call("GET", "/items/7");
  assert.equal(nf.status, 404);
  assert.deepEqual(nf.body, { error: { code: "NOT_FOUND", message: "פריט 7 לא נמצא" } });
  const route = await call("GET", "/nothing");
  assert.equal(route.status, 404);
  assert.equal(route.body?.error?.code, "NOT_FOUND");
  const boom = await call("GET", "/items/boom/now");
  assert.equal(boom.status, 500);
  assert.deepEqual(boom.body, { error: { code: "INTERNAL", message: "שגיאה פנימית" } });
  const json = await call("POST", "/items", undefined, { raw: '{"a": 1,' });
  assert.equal(json.status, 400);
  assert.deepEqual(json.body, { error: { code: "INVALID_JSON", message: "גוף הבקשה אינו JSON תקין" } });
  assert.deepEqual((await call("POST", "/items", { a: 1 })).body, { a: 1 });
});
