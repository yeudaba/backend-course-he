import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("GET /square/:n", async (t) => {
  const { MathModule } = exportsOf(import.meta.url, "P20-E37.ts", ["MathModule", "MathController"]);
  const { call } = await nestApp(t, MathModule);
  assert.deepEqual((await call("GET", "/square/7")).body, { n: 7, square: 49 });
  assert.deepEqual((await call("GET", "/square/-3")).body, { n: -3, square: 9 });
  assert.deepEqual((await call("GET", "/square/0")).body, { n: 0, square: 0 });
  assert.equal((await call("GET", "/square/abc")).status, 400);
  assert.equal((await call("GET", "/square/2.5")).status, 400);
});
