import { test } from "node:test";
import assert from "node:assert/strict";
import { JwtService } from "@nestjs/jwt";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E58.ts", ["createVerifier"])).createVerifier;
const NEW = "n".repeat(20) + "-new-secret-0123456789";
const OLD = "o".repeat(20) + "-old-secret-0123456789";
const OTHER = "x".repeat(40);
const jwt = new JwtService();
const sign = (secret, payload = { sub: 7 }, expiresIn = 900) => jwt.sign(payload, { secret, expiresIn });

test("מפתח חדש וישן", async () => {
  const verify = (await get())([NEW, OLD]);
  const a = await verify(sign(NEW, { sub: 1, role: "user" }));
  assert.equal(a.keyIndex, 0);
  assert.equal(a.payload.sub, 1);
  assert.equal(a.payload.role, "user");
  const b = await verify(sign(OLD, { sub: 2 }));
  assert.equal(b.keyIndex, 1);
  assert.equal(b.payload.sub, 2);
});
test("לא תקין", async () => {
  const verify = (await get())([NEW, OLD]);
  await assert.rejects(verify(sign(OTHER)), { message: "INVALID_TOKEN" });
  await assert.rejects(verify("garbage"), { message: "INVALID_TOKEN" });
  await assert.rejects(verify(sign(NEW).slice(0, -2) + "xx"), { message: "INVALID_TOKEN" });
});
test("פג תוקף ← TOKEN_EXPIRED, גם במפתח הישן", async () => {
  const verify = (await get())([NEW, OLD]);
  await assert.rejects(verify(sign(NEW, { sub: 1 }, -10)), { message: "TOKEN_EXPIRED" });
  await assert.rejects(verify(sign(OLD, { sub: 1 }, -10)), { message: "TOKEN_EXPIRED" });
  await assert.rejects(verify(sign(OTHER, { sub: 1 }, -10)), { message: "INVALID_TOKEN" }, "חתימה זרה — לא 'פג תוקף'");
});
test("מפתחות לא תקינים", async () => {
  const create = await get();
  assert.throws(() => create([]), { message: "מפתח לא תקין" });
  assert.throws(() => create([NEW, "short"]), { message: "מפתח לא תקין" });
});
