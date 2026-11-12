import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E54.ts", ["start"])).start;
function fakeT() {
  const fns = [];
  return { fns, after: (fn) => fns.push(fn), done: async () => { for (const fn of fns) await fn(); } };
}
function app() {
  const a = express();
  a.use(express.json());
  a.post("/echo", (req, res) => res.status(201).location("/echo/1").json({ got: req.body, type: req.get("content-type") ?? null }));
  a.get("/text", (req, res) => res.type("text/plain").send("שלום"));
  a.get("/headers", (req, res) => res.json({ type: req.get("content-type") ?? null }));
  a.delete("/x", (req, res) => res.status(204).end());
  a.get("/missing", (req, res) => res.status(404).json({ error: "לא נמצא" }));
  return a;
}

test("JSON, טקסט, 204", async () => {
  const start = await get();
  const t = fakeT();
  try {
    const call = await start(t, app());
    let r = await call("POST", "/echo", { name: "Mug" });
    assert.equal(r.status, 201);
    assert.equal(r.headers.get("location"), "/echo/1");
    assert.deepEqual(r.body, { got: { name: "Mug" }, type: "application/json" }, "body נשלח כ־JSON עם Content-Type");
    r = await call("GET", "/text");
    assert.deepEqual([r.status, r.body], [200, "שלום"], "תשובת טקסט ← מחרוזת");
    r = await call("DELETE", "/x");
    assert.deepEqual([r.status, r.body], [204, null], "204 ← null");
    r = await call("GET", "/missing");
    assert.deepEqual([r.status, r.body], [404, { error: "לא נמצא" }]);
    r = await call("GET", "/headers");
    assert.deepEqual(r.body, { type: null }, "בלי body — בלי Content-Type");
  } finally {
    await t.done();
  }
});
test("t.after סוגר את השרת, ופורט פנוי", async () => {
  const start = await get();
  const t1 = fakeT();
  const t2 = fakeT();
  const a = await start(t1, app());
  const b = await start(t2, app());
  assert.equal((await a("GET", "/text")).status, 200);
  assert.equal((await b("GET", "/text")).status, 200, "שני שרתים במקביל (listen(0))");
  assert.equal(t1.fns.length, 1, "נרשם t.after אחד");
  await t1.done();
  await t2.done();
  await assert.rejects(a("GET", "/text"), "אחרי t.after — השרת סגור");
});
