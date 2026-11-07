// P22-E18 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "./P22-E18.ts";

async function start(t: { after: (fn: () => void) => void }) {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const server: Server = await new Promise((resolve) => {
    const s = createApp({ now: () => clock.now }).listen(0, () => resolve(s));
  });
  t.after(() => server.close());
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;
  const call = async (method: string, path: string, { body, token }: { body?: unknown; token?: string } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: res.status === 204 ? null : await res.json() };
  };
  const login = async (email: string, password: string) => (await call("POST", "/login", { body: { email, password } })).body.token as string;
  return { call, login, clock };
}

test("כניסה", async (t) => {
  const { call } = await start(t);
  assert.equal((await call("POST", "/login", { body: { email: "dana@example.com", password: "wrong" } })).status, 401);
  const ok = await call("POST", "/login", { body: { email: "dana@example.com", password: "dana-password-1" } });
  assert.equal(ok.status, 200);
  assert.equal(typeof ok.body.token, "string");
});

test("בלי טוקן ← 401", async (t) => {
  const { call } = await start(t);
  assert.equal((await call("GET", "/notes")).status, 401);
  assert.equal((await call("GET", "/notes", { token: "made-up" })).status, 401);
});

test("כל אחד רואה ומוחק רק את שלו", async (t) => {
  const { call, login } = await start(t);
  const dana = await login("dana@example.com", "dana-password-1");
  const yossi = await login("yossi@example.com", "yossi-password-1");
  await call("POST", "/notes", { token: dana, body: { text: "של דנה" } });
  await call("POST", "/notes", { token: yossi, body: { text: "של יוסי" } });
  assert.deepEqual((await call("GET", "/notes", { token: yossi })).body, [{ id: 2, text: "של יוסי" }]);
  assert.equal((await call("DELETE", "/notes/1", { token: yossi })).status, 404);
  assert.deepEqual((await call("GET", "/notes", { token: dana })).body, [{ id: 1, text: "של דנה" }]);
  assert.equal((await call("DELETE", "/notes/1", { token: dana })).status, 204);
});

test("ה־session פג אחרי 15 דקות", async (t) => {
  const { call, login, clock } = await start(t);
  const dana = await login("dana@example.com", "dana-password-1");
  clock.now = new Date("2026-11-04T10:14:59Z");
  assert.equal((await call("GET", "/notes", { token: dana })).status, 200);
  clock.now = new Date("2026-11-04T10:15:00Z");
  assert.equal((await call("GET", "/notes", { token: dana })).status, 401);
});
