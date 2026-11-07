import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";
import { JwtService } from "@nestjs/jwt";

const { ProfileModule, JWT_SECRET } = loadNest(import.meta.url, "P21-E10.ts");
const sign = (payload, opts, secret = JWT_SECRET) => new JwtService({ secret }).signAsync(payload, opts);

test("GET /me", async (t) => {
  const { call } = await nestApp(t, ProfileModule);
  const token = await sign({ sub: 7, role: "user" }, { expiresIn: 900 });
  let res = await call("GET", "/me", undefined, { headers: { authorization: `Bearer ${token}` } });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 7, role: "user" });
  res = await call("GET", "/me", undefined, { headers: { authorization: `bearer ${token}` } });
  assert.equal(res.status, 200, "bearer באותיות קטנות");
  assert.deepEqual((await call("GET", "/hello")).body, { hello: "world" }, "route בלי guard");
});
test("401", async (t) => {
  const { call } = await nestApp(t, ProfileModule);
  let res = await call("GET", "/me");
  assert.equal(res.status, 401);
  assert.equal(res.body.message, "נדרשת התחברות");
  const old = Math.floor(Date.now() / 1000) - 3600;
  const cases = {
    "לא JWT": "abc",
    "סוד אחר": await sign({ sub: 7, role: "admin" }, { expiresIn: 900 }, "other-secret-other-secret-0123456789"),
    "פג תוקף": await sign({ sub: 7, role: "user", iat: old }, { expiresIn: 60 }),
  };
  for (const [name, token] of Object.entries(cases)) {
    res = await call("GET", "/me", undefined, { headers: { authorization: `Bearer ${token}` } });
    assert.equal(res.status, 401, name);
    assert.equal(res.body.message, "טוקן לא תקין", name);
  }
  res = await call("GET", "/me", undefined, { headers: { authorization: "Basic abc" } });
  assert.equal(res.body.message, "נדרשת התחברות", "לא Bearer");
});
