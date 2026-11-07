import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { requestId } = await load(import.meta.url, "P24-E08.ts");
async function start(t, opts) {
  const app = express();
  app.use(requestId(opts));
  app.get("/", (req, res) => res.json({ id: res.locals.requestId }));
  app.get("/boom", () => { throw new Error("x"); });
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("בלי header ← מזהה חדש, ב־header וב־res.locals", async (t) => {
  let n = 0;
  const call = await start(t, { generate: () => `gen-${++n}` });
  const a = await call("GET", "/");
  assert.equal(a.headers.get("x-request-id"), "gen-1");
  assert.deepEqual(a.body, { id: "gen-1" });
  assert.equal((await call("GET", "/")).headers.get("x-request-id"), "gen-2", "מזהה חדש לכל בקשה");
});
test("ברירת מחדל: randomUUID", async (t) => {
  const call = await start(t);
  assert.match((await call("GET", "/")).headers.get("x-request-id"), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/);
});
test("מזהה תקין מהלקוח — נשמר", async (t) => {
  const call = await start(t, { generate: () => "gen" });
  for (const id of ["abc", "web-7f3a.retry_2", "x".repeat(64)]) {
    const res = await call("GET", "/", undefined, { headers: { "X-Request-Id": id } });
    assert.equal(res.headers.get("x-request-id"), id);
    assert.equal(res.body.id, id);
  }
});
test("מזהה לא תקין — מוחלף", async (t) => {
  const call = await start(t, { generate: () => "gen" });
  for (const id of ["has space", "x".repeat(65), 'a"}{"level":"error', "a/b", "a;b"]) {
    const res = await call("GET", "/", undefined, { headers: { "X-Request-Id": id } });
    assert.equal(res.headers.get("x-request-id"), "gen", JSON.stringify(id));
  }
});
test("גם בתשובת שגיאה", async (t) => {
  const call = await start(t, { generate: () => "gen" });
  const res = await call("GET", "/boom");
  assert.equal(res.status, 500);
  assert.equal(res.headers.get("x-request-id"), "gen");
});
