// P22-E102 — בדיקות HTTP, מתוקנות
import { test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "./P22-E102.ts";

async function start(t: { after(fn: () => void): void }) {
  const server = await new Promise<Server>((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  t.after(() => server.close());
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;
  return (method: string, path: string, body?: unknown) =>
    fetch(base + path, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
}

test("POST ← 201, Location, ו־name אחרי trim", async (t) => {
  const call = await start(t);
  const res = await call("POST", "/items", { name: "  Mug " });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get("location"), "/items/1");
  assert.deepEqual(await res.json(), { id: 1, name: "Mug" });
});

test("ids מתחילים מ־1 בכל אפליקציה", async (t) => {
  const call = await start(t);
  assert.deepEqual(await (await call("POST", "/items", { name: "A" })).json(), { id: 1, name: "A" });
});


test("GET ← הפריט, ו־404 על id שלא קיים", async (t) => {
  const call = await start(t);
  await call("POST", "/items", { name: "Mug" });
  const res = await call("GET", "/items/1");
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { id: 1, name: "Mug" });
  assert.equal((await call("GET", "/items/2")).status, 404);
});

test("DELETE ← 204, והפריט באמת נמחק", async (t) => {
  const call = await start(t);
  await call("POST", "/items", { name: "Mug" });
  assert.equal((await call("DELETE", "/items/1")).status, 204);
  assert.equal((await call("GET", "/items/1")).status, 404);
  assert.equal((await call("DELETE", "/items/1")).status, 404);
});
