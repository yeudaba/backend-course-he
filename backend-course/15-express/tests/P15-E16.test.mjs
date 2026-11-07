import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp, UsersService, InMemoryUsersRepository, HttpError } = await load(import.meta.url, "P15-E16.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("service לבד, בלי HTTP", () => {
  const s = new UsersService(new InMemoryUsersRepository());
  const u = s.create({ name: "דנה", email: "dana@x.com" });
  assert.deepEqual(s.get(u.id), u);
  assert.throws(() => s.create({ name: "אחר", email: "DANA@x.com" }), (e) => e instanceof HttpError && e.status === 409 && e.code === "EMAIL_TAKEN");
  assert.throws(() => s.get(99), (e) => e instanceof HttpError && e.status === 404 && e.code === "USER_NOT_FOUND");
  s.remove(u.id);
  assert.deepEqual(s.list(), []);
  assert.throws(() => s.remove(u.id), (e) => e.status === 404);
});
test("routes", async (t) => {
  const call = await start(t, createApp());
  let res = await call("POST", "/users", { name: "דנה", email: "dana@x.com" });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get("location"), "/users/1");
  assert.deepEqual(res.body, { id: 1, name: "דנה", email: "dana@x.com" });
  assert.equal((await call("GET", "/users")).body.length, 1);
  assert.deepEqual((await call("GET", "/users/1")).body.name, "דנה");
  res = await call("POST", "/users", { name: "דן", email: "Dana@X.com" });
  assert.equal(res.status, 409);
  assert.deepEqual(res.body.error.code, "EMAIL_TAKEN");
  res = await call("POST", "/users", { name: "", email: "not-an-email" });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
  assert.equal((await call("GET", "/users/42")).body.error.code, "USER_NOT_FOUND");
  assert.equal((await call("DELETE", "/users/1")).status, 204);
  assert.equal((await call("DELETE", "/users/1")).status, 404);
});
test("service מוזרק", async (t) => {
  const service = new UsersService(new InMemoryUsersRepository());
  service.create({ name: "קיים", email: "a@b.co" });
  const call = await start(t, createApp(service));
  assert.equal((await call("GET", "/users")).body[0].name, "קיים");
});
