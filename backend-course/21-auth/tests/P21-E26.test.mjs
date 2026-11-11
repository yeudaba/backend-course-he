import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { exportsOf, typecheck, code } from "./_ts.mjs";

const FILE = "P21-E26.ts";
const SECRET = "dev-secret-at-least-32-characters-long!!";
const NOW = 1793872800;
const get = () => exportsOf(import.meta.url, FILE, ["signJwt", "verifyJwt"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("signJwt — אותו טוקן בדיוק כמו jsonwebtoken", async () => {
  const { signJwt } = await get();
  const mine = signJwt({ sub: 7, role: "user" }, SECRET, 900, NOW);
  const lib = jwt.sign({ sub: 7, role: "user", iat: NOW, exp: NOW + 900 }, SECRET);
  const [h1, p1] = mine.split(".");
  const [h2, p2] = lib.split(".");
  assert.equal(Buffer.from(h1 ?? "", "base64url").toString(), Buffer.from(h2, "base64url").toString(), "header: {\"alg\":\"HS256\",\"typ\":\"JWT\"} — באותו סדר");
  assert.equal(Buffer.from(p1 ?? "", "base64url").toString(), Buffer.from(p2, "base64url").toString(), "payload: sub, role, iat, exp — באותו סדר");
  assert.equal(mine, lib, "החתימה שונה — HMAC-SHA256 של `${header}.${payload}` עם הסוד, ב־base64url");
});
test("verifyJwt — טוקן של jsonwebtoken עובר", async () => {
  const { verifyJwt } = await get();
  const token = jwt.sign({ sub: 3, role: "admin", iat: NOW, exp: NOW + 60 }, SECRET);
  assert.deepEqual(verifyJwt(token, SECRET, NOW + 59), { sub: 3, role: "admin", iat: NOW, exp: NOW + 60 });
});
test("verifyJwt — תוקף", async () => {
  const { signJwt, verifyJwt } = await get();
  const token = signJwt({ sub: 7, role: "user" }, SECRET, 900, NOW);
  assert.throws(() => verifyJwt(token, SECRET, NOW + 900), { message: "פג תוקף" }, "בדיוק ב־exp הטוקן כבר לא תקף (now >= exp)");
  assert.throws(() => verifyJwt(token, SECRET, NOW + 5000), { message: "פג תוקף" });
});
test("verifyJwt — זיופים", async () => {
  const { signJwt, verifyJwt } = await get();
  const token = signJwt({ sub: 7, role: "user" }, SECRET, 900, NOW);
  const [h, p, s] = token.split(".");
  const evil = Buffer.from(JSON.stringify({ sub: 7, role: "admin", iat: NOW, exp: NOW + 900 })).toString("base64url");
  assert.throws(() => verifyJwt(`${h}.${evil}.${s}`, SECRET, NOW), { message: "חתימה לא תקינה" }, "payload שונה עם החתימה הישנה");
  assert.throws(() => verifyJwt(token, "another-secret-another-secret-another!!", NOW), { message: "חתימה לא תקינה" }, "סוד אחר");
  assert.throws(() => verifyJwt(`${h}.${p}.`, SECRET, NOW), { message: "חתימה לא תקינה" }, "חתימה ריקה");
  const none = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const fake = `${none}.${evil}`;
  const fakeSig = (await import("node:crypto")).createHmac("sha256", SECRET).update(fake).digest("base64url");
  assert.throws(() => verifyJwt(`${fake}.${fakeSig}`, SECRET, NOW), { message: "טוקן לא תקין" }, "header עם alg שאינו HS256 נדחה");
  for (const bad of ["", "abc", "a.b", "a.b.c.d"]) assert.throws(() => verifyJwt(bad, SECRET, NOW), { message: "טוקן לא תקין" }, JSON.stringify(bad));
});
test("השוואה בזמן קבוע", () => {
  assert.match(code(import.meta.url, FILE), /timingSafeEqual/, "השוואת חתימות עם crypto.timingSafeEqual — לא ===");
});
