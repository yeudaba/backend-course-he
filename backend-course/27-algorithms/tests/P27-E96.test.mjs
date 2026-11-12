import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { requestId } = await load(import.meta.url, "P27-E96.ts");

test("משתמש ב־id תקין, ומייצר חדש אחרת", async (t) => {
  const app = express();
  app.use(requestId());
  app.get("/", (req, res) => res.json({ id: res.locals.requestId }));
  const { base, close } = await listen(app);
  t.after(close);
  const get = (h) => fetch(base + "/", { headers: h });
  const a = await get({ "X-Request-Id": "abc-123_X" });
  assert.equal(a.headers.get("x-request-id"), "abc-123_X");
  assert.deepEqual(await a.json(), { id: "abc-123_X" });
  for (const bad of [undefined, "", "a".repeat(65), "has space", "x;y"]) {
    const r = await get(bad === undefined ? {} : { "X-Request-Id": bad });
    const id = r.headers.get("x-request-id");
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, `"${bad}" ← UUID חדש`);
    assert.equal((await r.json()).id, id);
  }
  const ids = new Set();
  for (let i = 0; i < 5; i++) ids.add((await get({})).headers.get("x-request-id"));
  assert.equal(ids.size, 5);
});
