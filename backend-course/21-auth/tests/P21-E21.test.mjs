import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";
import { JwtService } from "@nestjs/jwt";

const { AppModule, JWT_SECRET } = loadNest(import.meta.url, "P21-E21.ts");

test("bearer באותיות קטנות", async (t) => {
  const { call } = await nestApp(t, AppModule);
  const token = await new JwtService({ secret: JWT_SECRET }).signAsync({ sub: 1 });
  assert.equal((await call("GET", "/tasks", undefined, { headers: { authorization: `Bearer ${token}` } })).status, 200);
  assert.equal((await call("GET", "/tasks", undefined, { headers: { authorization: `bearer ${token}` } })).status, 200);
});
test("@Public על class", async (t) => {
  const { call } = await nestApp(t, AppModule);
  assert.deepEqual((await call("GET", "/status")).body, { ok: true });
});
test("טוקן לא תקין ← 401, לא 403", async (t) => {
  const { call } = await nestApp(t, AppModule);
  const res = await call("GET", "/tasks", undefined, { headers: { authorization: "Bearer not.a.token" } });
  assert.equal(res.status, 401);
  assert.equal(res.body.message, "טוקן לא תקין");
  assert.equal((await call("GET", "/tasks")).status, 401);
});
