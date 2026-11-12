import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P21-E99.ts", ["probeOwnership", "isSafe"]);

// שרת קטן: טוקן "A" = משתמש 1, "B" = משתמש 2. vulnerable: ה־PATCH בודק בעלות רק בתשובה — ומשנה בכל מקרה
async function server(t, { vulnerable }) {
  const app = express();
  app.use(express.json());
  const tasks = new Map();
  let next = 100;
  const order = [];
  app.use((req, res, next2) => {
    const u = { "Bearer A": 1, "Bearer B": 2 }[req.get("authorization")];
    if (!u) return res.status(401).json({ code: "UNAUTHORIZED" });
    req.user = u;
    order.push(`${req.method} ${u}`);
    next2();
  });
  app.post("/tasks", (req, res) => { const t2 = { id: next++, ownerId: req.user, title: req.body.title }; tasks.set(t2.id, t2); res.status(201).json({ id: t2.id, title: t2.title }); });
  const mine = (req) => { const x = tasks.get(Number(req.params.id)); return x && x.ownerId === req.user ? x : undefined; };
  app.get("/tasks/:id", (req, res) => { const x = mine(req); x ? res.json({ id: x.id, title: x.title }) : res.status(404).json({ code: "TASK_NOT_FOUND" }); });
  app.patch("/tasks/:id", (req, res) => {
    const x = tasks.get(Number(req.params.id));
    if (vulnerable && x) x.title = req.body.title;
    const m2 = mine(req);
    if (!m2) return res.status(404).json({ code: "TASK_NOT_FOUND" });
    m2.title = req.body.title;
    res.json({ id: m2.id, title: m2.title });
  });
  app.delete("/tasks/:id", (req, res) => { const x = mine(req); if (!x) return res.status(404).json({ code: "TASK_NOT_FOUND" }); tasks.delete(x.id); res.status(204).end(); });
  const s = await new Promise((r) => { const srv = app.listen(0, "127.0.0.1", () => r(srv)); });
  t.after(() => s.close());
  return { base: `http://127.0.0.1:${s.address().port}`, order, tasks };
}

test("שרת בטוח", async (t) => {
  const { probeOwnership, isSafe } = await get();
  const { base, order, tasks } = await server(t, { vulnerable: false });
  const r = await probeOwnership(base, "A", "B");
  assert.deepEqual(r, { get: 404, patch: 404, delete: 404, stillExists: true, title: "של A" });
  assert.equal(isSafe(r), true);
  assert.deepEqual(order, ["POST 1", "GET 2", "PATCH 2", "DELETE 2", "GET 1"], "הסדר: A יוצר, B מנסה GET/PATCH/DELETE ברצף, A קורא");
  assert.equal(tasks.size, 1);
});
test("שרת עם פרצה ב־PATCH — 404, אבל משנה", async (t) => {
  const { probeOwnership, isSafe } = await get();
  const { base } = await server(t, { vulnerable: true });
  const r = await probeOwnership(base, "A", "B");
  assert.deepEqual(r, { get: 404, patch: 404, delete: 404, stillExists: true, title: "B היה כאן" }, "ה־status נראה בטוח, אבל הכותרת השתנתה");
  assert.equal(isSafe(r), false, "isSafe בודק גם מה קרה בפועל");
});
test("isSafe — מקרים נוספים", async () => {
  const { isSafe } = await get();
  const ok = { get: 404, patch: 404, delete: 404, stillExists: true, title: "של A" };
  assert.equal(isSafe(ok), true);
  assert.equal(isSafe({ ...ok, get: 200 }), false);
  assert.equal(isSafe({ ...ok, get: 403 }), false, "403 מגלה שהמשימה קיימת");
  assert.equal(isSafe({ ...ok, delete: 204, stillExists: false, title: "" }), false);
  assert.equal(isSafe({ ...ok, stillExists: false }), false);
});
