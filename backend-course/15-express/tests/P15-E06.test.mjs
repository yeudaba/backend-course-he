import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E06.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("hello", async (t) => {
  const call = await start(t, createApp());
  assert.deepEqual((await call("GET", "/hello")).body, { message: "שלום אורח" });
  assert.deepEqual((await call("GET", "/hello?name=" + encodeURIComponent("דנה"))).body, { message: "שלום דנה" });
});
test("add", async (t) => {
  const call = await start(t, createApp());
  assert.deepEqual((await call("GET", "/add/2/3")).body, { sum: 5 });
  assert.deepEqual((await call("GET", "/add/-1.5/4")).body, { sum: 2.5 });
  const bad = await call("GET", "/add/2/x");
  assert.equal(bad.status, 400);
  assert.deepEqual(bad.body, { error: "a ו־b חייבים להיות מספרים" });
});
