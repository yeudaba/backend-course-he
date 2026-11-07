import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { HelloModule } = loadNest(import.meta.url, "P20-E06.ts");

test("GET /hello", async (t) => {
  const { call } = await nestApp(t, HelloModule);
  assert.deepEqual((await call("GET", "/hello")).body, { message: "שלום אורח" });
  const res = await call("GET", "/hello?name=" + encodeURIComponent("דנה"));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { message: "שלום דנה" });
});
