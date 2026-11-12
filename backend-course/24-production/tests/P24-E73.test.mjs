import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";

async function start(t) {
  const { notesRouter } = await exportsOf(import.meta.url, "P24-E73.ts", ["notesRouter"]);
  const app = express();
  app.use(express.json());
  app.use(notesRouter());
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}
const ID = "3f1c9a7e-0b5d-4c2a-9e11-7a6b5c4d3e2f";

test("יצירה, שליחה חוזרת ושינוי", async (t) => {
  const call = await start(t);
  const a = await call("PUT", `/notes/${ID}`, { text: "  לקנות חלב " });
  assert.equal(a.status, 201);
  assert.deepEqual(a.body, { id: ID, text: "לקנות חלב", version: 1 });
  assert.equal(a.headers.get("location"), `/notes/${ID}`);
  const b = await call("PUT", `/notes/${ID}`, { text: "לקנות חלב" });
  assert.equal(b.status, 200, "אותה בקשה שוב ← 200");
  assert.deepEqual(b.body, { id: ID, text: "לקנות חלב", version: 1 }, "version לא עלה");
  const c = await call("PUT", `/notes/${ID}`, { text: "לקנות לחם" });
  assert.deepEqual([c.status, c.body], [200, { id: ID, text: "לקנות לחם", version: 2 }]);
  const d = await call("PUT", `/notes/${ID}`, { text: "לקנות לחם" });
  assert.equal(d.body.version, 2);
  assert.deepEqual((await call("GET", `/notes/${ID}`)).body, { id: ID, text: "לקנות לחם", version: 2 });
});
test("שגיאות", async (t) => {
  const call = await start(t);
  for (const id of ["42", ID.toUpperCase(), ID + "0", "3f1c9a7e0b5d4c2a9e117a6b5c4d3e2f"]) {
    const r = await call("PUT", `/notes/${id}`, { text: "x" });
    assert.deepEqual([r.status, r.body?.error?.code], [400, "INVALID_ID"], id);
  }
  for (const body of [{}, { text: "   " }, { text: 5 }, { text: null }]) {
    const r = await call("PUT", `/notes/${ID}`, body);
    assert.deepEqual([r.status, r.body?.error?.code], [400, "VALIDATION_ERROR"], JSON.stringify(body));
    assert.equal(typeof r.body.error.message, "string");
  }
  const g = await call("GET", `/notes/${ID}`);
  assert.deepEqual([g.status, g.body?.error?.code], [404, "NOT_FOUND"], "בקשות לא תקינות לא יצרו כלום");
});
test("כל router — מאגר משלו", async (t) => {
  const one = await start(t);
  const two = await start(t);
  await one("PUT", `/notes/${ID}`, { text: "a" });
  assert.equal((await two("GET", `/notes/${ID}`)).status, 404);
  assert.equal((await two("PUT", `/notes/${ID}`, { text: "a" })).status, 201);
});
