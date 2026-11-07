import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { BookmarksAppModule, UsersService, CLOCK, CONFIG } = loadNest(import.meta.url, "P21-E24.ts");

async function start(t) {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const config = { jwtSecret: "e24-test-secret-0123456789-0123456789", accessTtlSeconds: 900, refreshTtlDays: 7, bcryptRounds: 4 };
  const ctx = await nestApp(t, BookmarksAppModule, { overrides: [[CLOCK, { now: () => clock.now }], [CONFIG, config]] });
  const as = (token) => (method, path, body) => ctx.call(method, path, body, { headers: { authorization: `Bearer ${token}` } });
  const signup = async (email) => {
    assert.equal((await ctx.call("POST", "/auth/register", { email, password: "long-password-1" })).status, 201);
    return (await ctx.call("POST", "/auth/login", { email, password: "long-password-1" })).body;
  };
  return { ...ctx, clock, as, signup };
}

test("הרשמה, כניסה, me", async (t) => {
  const { call, as, signup } = await start(t);
  let res = await call("POST", "/auth/register", { email: "Dana@Example.com", password: "long-password-1" });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, email: "dana@example.com", role: "user" });
  assert.equal((await call("POST", "/auth/register", { email: "dana@example.com", password: "long-password-1" })).status, 409);
  assert.equal((await call("POST", "/auth/register", { email: "x@example.com", password: "long-password-1", role: "admin" })).status, 400);
  const bad = await call("POST", "/auth/login", { email: "dana@example.com", password: "wrong-password" });
  const ghost = await call("POST", "/auth/login", { email: "ghost@example.com", password: "wrong-password" });
  assert.equal(bad.status, 401);
  assert.deepEqual(bad.body, ghost.body);
  const tokens = (await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" })).body;
  assert.ok(tokens.accessToken && tokens.refreshToken);
  assert.deepEqual((await as(tokens.accessToken)("GET", "/auth/me")).body, { id: 1, email: "dana@example.com", role: "user" });
  assert.equal((await call("GET", "/auth/me")).status, 401);
});

test("access token פג אחרי 15 דקות; refresh עם rotation", async (t) => {
  const { call, as, signup, clock } = await start(t);
  const first = await signup("dana@example.com");
  clock.now = new Date("2026-11-04T10:15:00Z");
  assert.equal((await as(first.accessToken)("GET", "/bookmarks")).status, 401);
  const second = (await call("POST", "/auth/refresh", { refreshToken: first.refreshToken })).body;
  assert.equal((await as(second.accessToken)("GET", "/bookmarks")).status, 200);
  assert.equal((await call("POST", "/auth/refresh", { refreshToken: first.refreshToken })).status, 401, "שימוש חוזר");
  assert.equal((await call("POST", "/auth/refresh", { refreshToken: second.refreshToken })).status, 401, "...ביטל הכול");
  const third = (await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" })).body;
  assert.equal((await call("POST", "/auth/logout", { refreshToken: third.refreshToken })).status, 204);
  assert.equal((await call("POST", "/auth/refresh", { refreshToken: third.refreshToken })).status, 401);
});

test("סימניות: כל אחד את שלו", async (t) => {
  const { as, signup } = await start(t);
  const dana = as((await signup("dana@example.com")).accessToken);
  const yossi = as((await signup("yossi@example.com")).accessToken);
  let res = await dana("POST", "/bookmarks", { url: "https://nestjs.com", title: "Nest" });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, url: "https://nestjs.com", title: "Nest" });
  assert.equal((await dana("POST", "/bookmarks", { url: "not a url", title: "x" })).status, 400);
  assert.equal((await dana("POST", "/bookmarks", { url: "https://x.com", title: "x", ownerId: 2 })).status, 400);
  await yossi("POST", "/bookmarks", { url: "https://prisma.io", title: "Prisma" });
  assert.deepEqual((await dana("GET", "/bookmarks")).body.map((b) => b.title), ["Nest"]);
  assert.equal((await yossi("DELETE", "/bookmarks/1")).status, 404);
  assert.equal((await dana("DELETE", "/bookmarks/1")).status, 204);
  assert.deepEqual((await dana("GET", "/bookmarks")).body, []);
});

test("admin", async (t) => {
  const { call, as, signup, moduleRef } = await start(t);
  const dana = as((await signup("dana@example.com")).accessToken);
  assert.equal((await dana("GET", "/admin/users")).status, 403);
  await moduleRef.get(UsersService).create("boss@example.com", "boss-password-1", "admin");
  const boss = (await call("POST", "/auth/login", { email: "boss@example.com", password: "boss-password-1" })).body;
  const res = await as(boss.accessToken)("GET", "/admin/users");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.map((u) => u.role), ["user", "admin"]);
  assert.ok(res.body.every((u) => !("passwordHash" in u)));
});
