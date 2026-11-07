// P22-E14 — הבדיקות
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "./P22-E14.ts";

// שרת אמיתי על פורט פנוי (0), ו־fetch אמיתי. אפליקציה חדשה לכל בדיקה — בלי state משותף
async function start(t: { after: (fn: () => void) => void }) {
  const server: Server = await new Promise((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  t.after(() => server.close());
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;
  return (method: string, path: string, body?: unknown) =>
    fetch(base + path, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
}

test("POST ← 201 עם Location, ואז GET", async (t) => {
  const call = await start(t);
  const res = await call("POST", "/items", { name: "  Mug  " });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get("location"), "/items/1");
  assert.deepEqual(await res.json(), { id: 1, name: "Mug" });
  assert.deepEqual(await (await call("GET", "/items/1")).json(), { id: 1, name: "Mug" });
  assert.deepEqual(await (await call("GET", "/items")).json(), [{ id: 1, name: "Mug" }]);
});

test("ולידציה ← 400", async (t) => {
  const call = await start(t);
  for (const body of [{ name: "" }, { name: "   " }, { name: "x".repeat(51) }, {}]) {
    assert.equal((await call("POST", "/items", body)).status, 400, JSON.stringify(body));
  }
  assert.equal((await call("POST", "/items", { name: "x".repeat(50) })).status, 201);
});

test("404 ו־DELETE", async (t) => {
  const call = await start(t);
  assert.equal((await call("GET", "/items/9")).status, 404);
  await call("POST", "/items", { name: "Mug" });
  assert.equal((await call("DELETE", "/items/1")).status, 204);
  assert.equal((await call("GET", "/items/1")).status, 404);
  assert.equal((await call("DELETE", "/items/1")).status, 404);
});
