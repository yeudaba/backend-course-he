import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E48.ts";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
async function start(t) {
  const { requestId } = await exportsOf(import.meta.url, FILE, ["requestId"]);
  const app = express();
  app.use(requestId());
  app.get("/", (req, res) => {
    res.json({ id: res.locals.requestId });
  });
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("מזהה תקין מהבקשה", async (t) => {
  const call = await start(t);
  for (const id of ["abc-123", "A", "x".repeat(64), "3f2c9a1e-0b7d-4c1a-9f00-2a6b8c4d5e6f"]) {
    const r = await call("GET", "/", undefined, { headers: { "X-Request-Id": id } });
    assert.equal(r.status, 200, "next() נקרא");
    assert.equal(r.headers.get("x-request-id"), id);
    assert.deepEqual(r.body, { id });
  }
});
test("חסר או לא תקין ← UUID חדש", async (t) => {
  const call = await start(t);
  const seen = new Set();
  for (const headers of [{}, { "X-Request-Id": "<script>" }, { "X-Request-Id": "x".repeat(65) }, { "X-Request-Id": "a b" }, { "X-Request-Id": "a_b" }]) {
    const r = await call("GET", "/", undefined, { headers });
    const id = r.headers.get("x-request-id");
    assert.match(id ?? "", UUID, `${JSON.stringify(headers)} ← crypto.randomUUID()`);
    assert.equal(r.body.id, id, "אותו מזהה ב־res.locals וב־header");
    seen.add(id);
  }
  assert.equal(seen.size, 5, "UUID חדש לכל בקשה");
});
