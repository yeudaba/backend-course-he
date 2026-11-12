import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P21-E50.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["jwtInfo"])).jwtInfo;
const NOW = 1793872800;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("טוקן אמיתי", async () => {
  const info = await get();
  const t = jwt.sign({ sub: 7, role: "user", iat: NOW, exp: NOW + 900 }, "any-secret");
  assert.deepEqual(info(t, NOW + 660), { alg: "HS256", sub: 7, role: "user", secondsLeft: 240, expired: false });
  assert.deepEqual(info(t, NOW + 899), { alg: "HS256", sub: 7, role: "user", secondsLeft: 1, expired: false });
  assert.deepEqual(info(t, NOW + 900), { alg: "HS256", sub: 7, role: "user", secondsLeft: 0, expired: true }, "בשנייה של exp — כבר פג");
  assert.deepEqual(info(t, NOW + 5000), { alg: "HS256", sub: 7, role: "user", secondsLeft: 0, expired: true }, "secondsLeft לא שלילי");
  const t2 = jwt.sign({ sub: 3, role: "admin", iat: NOW, exp: NOW + 60 }, "other", { algorithm: "HS512" });
  assert.deepEqual(info(t2, NOW), { alg: "HS512", sub: 3, role: "admin", secondsLeft: 60, expired: false }, "בלי בדיקת חתימה: גם סוד אחר ואלגוריתם אחר");
});
test("base64url (עם - ו־_)", async () => {
  const info = await get();
  const h = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const p = Buffer.from(JSON.stringify({ sub: 1, role: "?>?>~~~", exp: NOW + 10 })).toString("base64url");
  assert.ok(/[-_]/.test(p), "payload שיש בו - או _");
  assert.equal(info(`${h}.${p}.sig`, NOW).role, "?>?>~~~");
});
test("לא תקין ← Error", async () => {
  const info = await get();
  const p = Buffer.from(JSON.stringify({ sub: 1, exp: 1 })).toString("base64url");
  for (const bad of ["", "abc", "a.b", "a.b.c.d", `!!!.${p}.x`, `${p}.not-json.x`]) {
    assert.throws(() => info(bad, NOW), { message: "טוקן לא תקין" }, JSON.stringify(bad));
  }
});
