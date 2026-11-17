import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E63.ts", ["AccessTokens"])).AccessTokens;
const SECRET = "p21-e63-secret-at-least-32-chars!!";
const T0 = 1793872800;

test("issue ו־verify, לפי השעון", async () => {
  const AccessTokens = await get();
  let now = T0;
  const a = new AccessTokens(SECRET, () => now);
  const t = await a.issue(7);
  const p = jwt.verify(t, SECRET, { clockTimestamp: T0 });
  assert.equal(p.sub, 7);
  assert.equal(p.ver, 0, "גרסה ראשונה: 0");
  assert.equal(p.iat, T0, "iat מהשעון שהוזרק");
  assert.equal(p.exp, T0 + 900);
  assert.deepEqual(await a.verify(t), { id: 7 });
  now = T0 + 899;
  assert.deepEqual(await a.verify(t), { id: 7 });
  now = T0 + 900;
  await assert.rejects(a.verify(t), { message: "טוקן לא תקין" }, "פג — לפי now(), לא לפי השעון של המחשב");
});
test("logoutEverywhere", async () => {
  const AccessTokens = await get();
  const a = new AccessTokens(SECRET, () => T0);
  const d1 = await a.issue(1);
  const d2 = await a.issue(1);
  const y = await a.issue(2);
  a.logoutEverywhere(1);
  await assert.rejects(a.verify(d1), { message: "טוקן לא תקין" });
  await assert.rejects(a.verify(d2), { message: "טוקן לא תקין" });
  assert.deepEqual(await a.verify(y), { id: 2 }, "של משתמש אחר — ממשיך לעבוד");
  const d3 = await a.issue(1);
  assert.equal(jwt.decode(d3).ver, 1);
  assert.deepEqual(await a.verify(d3), { id: 1 }, "טוקן חדש אחרי היציאה — עובד");
  a.logoutEverywhere(1);
  await assert.rejects(a.verify(d3), { message: "טוקן לא תקין" });
});
test("זיופים", async () => {
  const AccessTokens = await get();
  const a = new AccessTokens(SECRET, () => T0);
  const other = jwt.sign({ sub: 1, ver: 0, iat: T0, exp: T0 + 900 }, "another-secret-another-secret-12345");
  await assert.rejects(a.verify(other), { message: "טוקן לא תקין" });
  await assert.rejects(a.verify("abc"), { message: "טוקן לא תקין" });
  a.logoutEverywhere(5);
  const future = jwt.sign({ sub: 5, ver: 7, iat: T0, exp: T0 + 900 }, SECRET);
  await assert.rejects(a.verify(future), { message: "טוקן לא תקין" }, "ver חייב להיות שווה בדיוק");
  const noVer = jwt.sign({ sub: 9, iat: T0, exp: T0 + 900 }, SECRET);
  await assert.rejects(a.verify(noVer), { message: "טוקן לא תקין" }, "בלי ver");
});
