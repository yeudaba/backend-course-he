import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

import express from "express";
import { ObjectId } from "mongodb";
import { listen, api } from "../../tools/load.mjs";
const { notesRouter } = await load(import.meta.url, "P25.7-E19.ts");

async function start(t) {
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  const app = express();
  app.use(express.json());
  app.use("/notes", notesRouter(db));
  const { base, close } = await listen(app);
  t.after(close);
  return { db, call: api(base) };
}
test("POST ← 201 עם id; GET ← הפתק", async (t) => {
  const { call } = await start(t);
  const c = await call("POST", "/notes", { text: "  buy beans " });
  assert.equal(c.status, 201);
  assert.match(c.body.id, /^[0-9a-f]{24}$/, "id — מחרוזת hex של 24 תווים");
  const g = await call("GET", `/notes/${c.body.id}`);
  assert.equal(g.status, 200);
  assert.equal(g.body.id, c.body.id);
  assert.equal(g.body.text, "buy beans");
  assert.match(g.body.createdAt, /^\d{4}-\d\d-\d\dT/);
});
test("מזהה לא תקין ← 400; תקין אבל לא קיים ← 404", async (t) => {
  const { call } = await start(t);
  for (const bad of ["abc", "123", "aaaaaaaaaaaa", "zzzzzzzzzzzzzzzzzzzzzzzz"]) assert.equal((await call("GET", `/notes/${bad}`)).status, 400, bad);
  assert.equal((await call("GET", `/notes/${new ObjectId().toHexString()}`)).status, 404);
});
test("text חסר או לא מחרוזת ← 400", async (t) => {
  const { call, db } = await start(t);
  for (const body of [{}, { text: "" }, { text: "   " }, { text: 5 }]) assert.equal((await call("POST", "/notes", body)).status, 400, JSON.stringify(body));
  assert.equal(await db.collection("notes").countDocuments(), 0);
});
