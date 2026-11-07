import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";
import { JwtService } from "@nestjs/jwt";

const { NotesModule, JWT_SECRET } = loadNest(import.meta.url, "P21-E11.ts");

test("guard גלובלי, @Public ו־@CurrentUser", async (t) => {
  const { call } = await nestApp(t, NotesModule);
  assert.equal((await call("GET", "/notes/mine")).status, 401, "ברירת מחדל: מוגן");
  assert.deepEqual((await call("GET", "/notes/public")).body, { notes: ["פתק לכולם"] }, "@Public על מתודה");
  assert.deepEqual((await call("GET", "/info")).body, { name: "notes-api", version: "1.0" }, "@Public על class");
  const token = await new JwtService({ secret: JWT_SECRET }).signAsync({ sub: 5, role: "user" });
  const res = await call("GET", "/notes/mine", undefined, { headers: { authorization: `Bearer ${token}` } });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { owner: 5, notes: ["הפתק של משתמש 5"] });
  assert.equal((await call("GET", "/notes/mine", undefined, { headers: { authorization: "Bearer x.y.z" } })).status, 401);
});
