import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E49.ts";
const ERR = { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "שלח JSON עם Content-Type: application/json" } };
async function start(t) {
  const { requireJson } = await exportsOf(import.meta.url, FILE, ["requireJson"]);
  const app = express();
  app.use(requireJson);
  app.use(express.json());
  app.all("/x", (req, res) => {
    res.json({ method: req.method, body: req.body ?? null });
  });
  const { base, close } = await listen(app);
  t.after(close);
  return async (method, type, body) => {
    const headers = type === undefined ? {} : { "Content-Type": type };
    const res = await fetch(base + "/x", { method, headers, body });
    return { status: res.status, body: await res.json() };
  };
}
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("JSON תקין עובר", async (t) => {
  const send = await start(t);
  for (const type of ["application/json", "application/json; charset=utf-8", "Application/JSON", " application/json ;charset=UTF-8"]) {
    for (const method of ["POST", "PUT", "PATCH"]) {
      const r = await send(method, type, '{"a":1}');
      assert.equal(r.status, 200, `${method} עם ${type}`);
      assert.deepEqual(r.body.body, { a: 1 });
    }
  }
});
test("בלי JSON ← 415", async (t) => {
  const send = await start(t);
  for (const [method, type, body] of [["POST", "text/plain", "x"], ["PUT", "application/x-www-form-urlencoded", "a=1"], ["PATCH", "text/json", "{}"], ["POST", undefined, undefined], ["POST", "application/jsonp", "{}"]]) {
    const r = await send(method, type, body);
    assert.deepEqual([r.status, r.body], [415, ERR], `${method} עם ${type}`);
  }
});
test("GET ו־DELETE לא נבדקים", async (t) => {
  const send = await start(t);
  assert.equal((await send("GET")).status, 200);
  assert.equal((await send("DELETE")).status, 200);
  assert.equal((await send("DELETE", "text/plain", "x")).status, 200);
});
