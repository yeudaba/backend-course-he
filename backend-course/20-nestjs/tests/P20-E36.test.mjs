import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

const get = () => exportsOf(import.meta.url, "P20-E36.ts", ["AppModule", "HealthModule", "CatalogModule"]);
test("AppModule — שני ה־modules יחד", async (t) => {
  const { AppModule } = get();
  const { call } = await nestApp(t, AppModule);
  assert.deepEqual((await call("GET", "/health")).body, { status: "ok" });
  assert.deepEqual((await call("GET", "/catalog/2")).body, { id: 2, name: "Kettle" });
  const nf = await call("GET", "/catalog/9");
  assert.equal(nf.status, 404);
  assert.equal(nf.body?.message, "פריט 9 לא נמצא");
  assert.equal((await call("GET", "/catalog/abc")).status, 400, "ParseIntPipe");
});
test("כל module לבד", async (t) => {
  const { HealthModule, CatalogModule } = get();
  const h = await nestApp(t, HealthModule);
  assert.deepEqual((await h.call("GET", "/health")).body, { status: "ok" });
  assert.equal((await h.call("GET", "/catalog/1")).status, 404, "ב־HealthModule אין catalog");
  const c = await nestApp(t, CatalogModule);
  assert.deepEqual((await c.call("GET", "/catalog/1")).body, { id: 1, name: "Mug" });
  assert.equal((await c.call("GET", "/health")).status, 404);
});
