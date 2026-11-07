import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { createServer } = await load(import.meta.url, "P14-E20.mjs");

test("השרת", async (t) => {
  const { base, close } = await listen(createServer());
  t.after(close);
  const get = (p) => fetch(base + p, { redirect: "manual", signal: AbortSignal.timeout(1000) });

  await t.test("/health מחזיר JSON", async () => {
    const res = await get("/health");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /application\/json/);
  });
  await t.test("/old-users לא נתקע", async () => {
    const res = await get("/old-users");
    assert.equal(res.status, 301);
    assert.equal(res.headers.get("location"), "/users");
  });
  await t.test("כתובת לא קיימת → 404", async () => {
    const res = await get("/nope");
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: "לא נמצא" });
  });
  await t.test("/users לא נשבר", async () => assert.deepEqual(await (await get("/users")).json(), [{ id: 1, name: "דנה" }]));
});
