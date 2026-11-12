// P22-E95 — בדיקות e2e: בעלות ותפקידים
import { test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "./P22-E95.ts";

async function start(t: { after(fn: () => void): void }) {
  const server = await new Promise<Server>((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  t.after(() => server.close());
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;
  return (method: string, path: string, token?: string, body?: unknown) =>
    fetch(base + path, {
      method,
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
}

test("בלי התחברות ← 401", async (t) => {
  const call = await start(t);
  assert.equal((await call("GET", "/notes")).status, 401);
  assert.equal((await call("GET", "/notes", "nobody")).status, 401);
  assert.equal((await call("GET", "/users")).status, 401, "401 גם ב־/users — לא 403");
});

test("כל אחד רואה רק את שלו", async (t) => {
  const call = await start(t);
  const note = await (await call("POST", "/notes", "dana", { text: "של דנה" })).json();
  await call("POST", "/notes", "yossi", { text: "של יוסי" });
  assert.deepEqual(await (await call("GET", "/notes", "dana")).json(), [note]);
  assert.equal((await call("GET", `/notes/${note.id}`, "dana")).status, 200);
  assert.equal((await call("GET", `/notes/${note.id}`, "yossi")).status, 404);
});

test("יוסי לא מוחק פתק של דנה", async (t) => {
  const call = await start(t);
  const note = await (await call("POST", "/notes", "dana", { text: "סוד" })).json();
  assert.equal((await call("DELETE", `/notes/${note.id}`, "yossi")).status, 404);
  assert.equal((await call("GET", `/notes/${note.id}`, "dana")).status, 200, "הפתק עדיין קיים");
  assert.equal((await call("DELETE", `/notes/${note.id}`, "dana")).status, 204);
  assert.equal((await call("GET", `/notes/${note.id}`, "dana")).status, 404);
});

test("/users — רק admin", async (t) => {
  const call = await start(t);
  assert.equal((await call("GET", "/users", "dana")).status, 403);
  const r = await call("GET", "/users", "admin");
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), [{ id: 1, role: "user" }, { id: 2, role: "user" }, { id: 3, role: "admin" }]);
});
