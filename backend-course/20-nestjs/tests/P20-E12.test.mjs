import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { ItemsModule, ApiExceptionFilter, validationPipe } = loadNest(import.meta.url, "P20-E12.ts");
const setup = (app) => {
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(validationPipe());
};

test("שגיאות HTTP במבנה אחיד", async (t) => {
  const { call } = await nestApp(t, ItemsModule, { setup });
  let res = await call("GET", "/items/5");
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: { code: "NOT_FOUND", message: "פריט 5 לא נמצא" } });
  res = await call("GET", "/nothing");
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: { code: "NOT_FOUND", message: "Cannot GET /nothing" } });
  res = await call("GET", "/items/abc");
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "BAD_REQUEST");
});
test("ולידציה ← VALIDATION_ERROR עם details", async (t) => {
  const { call } = await nestApp(t, ItemsModule, { setup });
  let res = await call("POST", "/items", { name: "", color: "red" });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
  assert.equal(res.body.error.message, "קלט לא תקין");
  assert.deepEqual(res.body.error.details.map((d) => d.field).sort(), ["color", "name"]);
  assert.ok(res.body.error.details.every((d) => Array.isArray(d.messages) && d.messages.length > 0));
  res = await call("POST", "/items", { name: "Lamp" });
  assert.equal(res.status, 201);
  assert.deepEqual((await call("GET", "/items/1")).body, { id: 1, name: "Lamp" });
});
