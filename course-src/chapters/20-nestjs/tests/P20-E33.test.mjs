import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("GET /status", async (t) => {
  const { StatusModule } = exportsOf(import.meta.url, "P20-E33.ts", ["StatusModule", "StatusController"]);
  const { call } = await nestApp(t, StatusModule);
  const r = await call("GET", "/status");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { status: "ok", version: "1.0.0" });
  assert.equal((await call("GET", "/nope")).status, 404);
});
