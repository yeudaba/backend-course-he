import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { createHelloServer } = await load(import.meta.url, "P14-E11.mjs");
const get = (base, path, init = {}) => fetch(base + path, { signal: AbortSignal.timeout(2000), ...init });

test("השרת", async (t) => {
  const { base, close } = await listen(createHelloServer());
  t.after(close);

  await t.test("GET /", async () => {
    const res = await get(base, "/?x=1");
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "application/json; charset=utf-8");
    assert.deepEqual(await res.json(), { message: "שלום" });
  });
  await t.test("GET /time", async () => {
    const res = await get(base, "/time");
    const { now } = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Math.abs(Date.parse(now) - Date.now()) < 5000, "now צריך להיות הזמן הנוכחי ב־ISO");
  });
  await t.test("405", async () => {
    const res = await get(base, "/", { method: "POST" });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "GET");
  });
  await t.test("404", async () => {
    const res = await get(base, "/nope");
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("content-type"), "application/json; charset=utf-8");
    assert.deepEqual(await res.json(), { error: "לא נמצא" });
  });
});
