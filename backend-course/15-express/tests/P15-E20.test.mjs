import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E20.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("הסדר", async (t) => {
  const call = await start(t, createApp());
  assert.deepEqual((await call("GET", "/tasks")).body, []);
  const created = await call("POST", "/tasks", { title: "א" });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, { id: 1, title: "א" });
  const orig = console.error;
  console.error = () => {};
  let res;
  try {
    res = await call("GET", "/tasks/boom");
  } finally {
    console.error = orig;
  }
  assert.equal(res.status, 500);
  assert.deepEqual(res.body, { error: { code: "INTERNAL", message: "שגיאה פנימית" } });
  res = await call("GET", "/nope");
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, "NOT_FOUND");
});
