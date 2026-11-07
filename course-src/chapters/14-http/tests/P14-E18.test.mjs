import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { createNotesServer } = await load(import.meta.url, "P14-E18.mjs");

async function setup(t) {
  const { base, close } = await listen(createNotesServer());
  t.after(close);
  return (method, path, body, raw) =>
    fetch(base + path, {
      method,
      headers: body !== undefined || raw ? { "Content-Type": "application/json" } : {},
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
      signal: AbortSignal.timeout(2000),
    });
}

test("יצירה וקריאה", async (t) => {
  const req = await setup(t);
  let res = await req("GET", "/notes");
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);

  res = await req("POST", "/notes", { text: "  לקנות חלב  " });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get("location"), "/notes/1");
  assert.equal(res.headers.get("content-type"), "application/json; charset=utf-8");
  assert.deepEqual(await res.json(), { id: 1, text: "לקנות חלב", done: false });

  await req("POST", "/notes", { text: "שני" });
  res = await req("GET", "/notes/2");
  assert.deepEqual(await res.json(), { id: 2, text: "שני", done: false });
  assert.equal((await (await req("GET", "/notes")).json()).length, 2);
});

test("עדכון ומחיקה", async (t) => {
  const req = await setup(t);
  await req("POST", "/notes", { text: "א" });
  let res = await req("PATCH", "/notes/1", { done: true });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { id: 1, text: "א", done: true });
  res = await req("PATCH", "/notes/1", { text: "ב" });
  assert.deepEqual(await res.json(), { id: 1, text: "ב", done: true });

  res = await req("DELETE", "/notes/1");
  assert.equal(res.status, 204);
  assert.equal(await res.text(), "");
  assert.equal((await req("GET", "/notes/1")).status, 404);
  assert.equal((await req("DELETE", "/notes/1")).status, 404);
  assert.equal((await req("PATCH", "/notes/1", { done: true })).status, 404);
});

test("ולידציה ושגיאות", async (t) => {
  const req = await setup(t);
  for (const body of [{}, { text: "   " }, { text: 5 }, { text: "x".repeat(201) }, [1]]) {
    const res = await req("POST", "/notes", body);
    assert.equal(res.status, 400, `POST ${JSON.stringify(body)}`);
    assert.equal(typeof (await res.json()).error, "string");
  }
  assert.equal((await req("POST", "/notes", undefined, "{oops")).status, 400);
  await req("POST", "/notes", { text: "א" });
  for (const body of [{}, { done: "yes" }, { text: "" }]) {
    assert.equal((await req("PATCH", "/notes/1", body)).status, 400, `PATCH ${JSON.stringify(body)}`);
  }
  let res = await req("PUT", "/notes");
  assert.equal(res.status, 405);
  assert.match(res.headers.get("allow") ?? "", /GET/);
  res = await req("GET", "/other");
  assert.equal(res.status, 404);
  assert.equal(typeof (await res.json()).error, "string");
});

test("כל שרת עם רשימה משלו", async (t) => {
  const a = await setup(t);
  const b = await setup(t);
  await a("POST", "/notes", { text: "א" });
  assert.deepEqual(await (await b("GET", "/notes")).json(), []);
});
