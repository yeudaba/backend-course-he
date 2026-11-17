// P22-E101 — בדיקות ל־error handler
import { test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "./P22-E101.ts";

async function start(t: { after(fn: () => void): void }) {
  const server = await new Promise<Server>((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  t.after(() => server.close());
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;
  return (method: string, path: string, raw?: string) =>
    fetch(base + path, { method, headers: { "content-type": "application/json" }, body: raw });
}

test("HttpError ← ה־status וה־code שלו", async (t) => {
  const call = await start(t);
  const r = await call("GET", "/http-error");
  assert.equal(r.status, 409);
  assert.deepEqual(await r.json(), { code: "EMAIL_TAKEN", message: "האימייל כבר רשום" });
});

test("ZodError ← 400 עם details", async (t) => {
  const call = await start(t);
  const r = await call("POST", "/validate", JSON.stringify({ name: 5 }));
  assert.equal(r.status, 400);
  const body = await r.json();
  assert.equal(body.code, "VALIDATION_ERROR");
  assert.equal(typeof body.message, "string");
  assert.deepEqual(body.details.map((d: { path: string }) => d.path), ["name"]);
  const ok = await call("POST", "/validate", JSON.stringify({ name: "x" }));
  assert.equal(ok.status, 200);
});

test("JSON שבור ← 400 INVALID_JSON", async (t) => {
  const call = await start(t);
  const r = await call("POST", "/validate", "{oops");
  assert.equal(r.status, 400);
  assert.equal((await r.json()).code, "INVALID_JSON");
});

test("שגיאה לא צפויה ← 500 כללי, בלי פרטים", async (t) => {
  const call = await start(t);
  const r = await call("GET", "/boom");
  assert.equal(r.status, 500);
  const body = await r.json();
  assert.deepEqual(body, { code: "INTERNAL", message: "שגיאה פנימית" });
  assert.doesNotMatch(JSON.stringify(body), /db password|at /);
});
