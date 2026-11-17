// P22-E80 — בדיקות ל־verifyJwt
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { signJwt, verifyJwt } from "./P22-E80.ts";

const SECRET = "test-secret-at-least-32-characters!!";
const NOW = 1793872800;
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const sign = (h: string, p: string, secret = SECRET) => createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");

test("טוקן תקין", () => {
  const t = signJwt({ sub: 7, role: "user" }, SECRET, 900, NOW);
  assert.deepEqual(verifyJwt(t, SECRET, NOW), { sub: 7, role: "user", iat: NOW, exp: NOW + 900 });
  assert.deepEqual(verifyJwt(t, SECRET, NOW + 899).sub, 7);
});

test("תוקף — בדיוק ב־exp כבר פג", () => {
  const t = signJwt({ sub: 7, role: "user" }, SECRET, 900, NOW);
  assert.throws(() => verifyJwt(t, SECRET, NOW + 900), { message: "פג תוקף" });
});

test("payload ששונה ← חתימה לא תקינה", () => {
  const [h, , s] = signJwt({ sub: 7, role: "user" }, SECRET, 900, NOW).split(".");
  const evil = b64({ sub: 7, role: "admin", iat: NOW, exp: NOW + 900 });
  assert.throws(() => verifyJwt(`${h}.${evil}.${s}`, SECRET, NOW), { message: "חתימה לא תקינה" });
});

test("סוד אחר ← חתימה לא תקינה", () => {
  const t = signJwt({ sub: 7, role: "user" }, "another-secret-another-secret-123", 900, NOW);
  assert.throws(() => verifyJwt(t, SECRET, NOW), { message: "חתימה לא תקינה" });
});

test("מזויף ופג — החתימה קודם", () => {
  const h = b64({ alg: "HS256", typ: "JWT" });
  const p = b64({ sub: 1, role: "admin", iat: NOW - 2000, exp: NOW - 1000 });
  assert.throws(() => verifyJwt(`${h}.${p}.${sign(h, p, "wrong-secret-wrong-secret-wrong-12")}`, SECRET, NOW), { message: "חתימה לא תקינה" });
});

test("alg: none ← טוקן לא תקין, גם עם חתימה שמתאימה", () => {
  const h = b64({ alg: "none", typ: "JWT" });
  const p = b64({ sub: 1, role: "admin", iat: NOW, exp: NOW + 900 });
  assert.throws(() => verifyJwt(`${h}.${p}.${sign(h, p)}`, SECRET, NOW), { message: "טוקן לא תקין" });
});

test("מבנה שבור", () => {
  for (const bad of ["", "abc", "a.b", "a.b.c.d"]) assert.throws(() => verifyJwt(bad, SECRET, NOW), { message: "טוקן לא תקין" }, JSON.stringify(bad));
  const [h, p] = signJwt({ sub: 7, role: "user" }, SECRET, 900, NOW).split(".");
  assert.throws(() => verifyJwt(`${h}.${p}.`, SECRET, NOW), { message: "חתימה לא תקינה" }, "חתימה ריקה");
  assert.throws(() => verifyJwt(`${h}.${p}.abc`, SECRET, NOW), { message: "חתימה לא תקינה" }, "חתימה קצרה");
});
