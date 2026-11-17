import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P22-E90.ts", ["signUp", "auth"]);
async function api(t) {
  const app = express();
  app.use(express.json());
  const users = new Map();
  const log = [];
  app.post("/auth/register", (req, res) => {
    log.push(["register", req.body]);
    const { email, password } = req.body ?? {};
    if (typeof password !== "string" || password.length < 8) return res.status(400).json({ code: "VALIDATION_ERROR" });
    if (users.has(email)) return res.status(409).json({ code: "EMAIL_TAKEN" });
    users.set(email, password);
    res.status(201).json({ id: users.size, email });
  });
  app.post("/auth/login", (req, res) => {
    log.push(["login", req.body]);
    const { email, password } = req.body ?? {};
    if (users.get(email) !== password || email === "broken@example.com") return res.status(401).json({ code: "INVALID_CREDENTIALS" });
    res.json({ accessToken: `A-${email}`, refreshToken: `R-${email}`, tokenType: "Bearer", expiresIn: 900 });
  });
  const s = await new Promise((r) => { const srv = app.listen(0, "127.0.0.1", () => r(srv)); });
  t.after(() => s.close());
  return { base: `http://127.0.0.1:${s.address().port}`, log };
}

test("signUp", async (t) => {
  const { signUp } = await get();
  const { base, log } = await api(t);
  assert.deepEqual(await signUp(base, "dana@example.com"), { accessToken: "A-dana@example.com", refreshToken: "R-dana@example.com" }, "רק שני הטוקנים");
  assert.deepEqual(log, [["register", { email: "dana@example.com", password: "password-123" }], ["login", { email: "dana@example.com", password: "password-123" }]]);
  assert.deepEqual(await signUp(base, "yossi@example.com", "yossi-pass-1"), { accessToken: "A-yossi@example.com", refreshToken: "R-yossi@example.com" });
  assert.deepEqual(log[2][1], { email: "yossi@example.com", password: "yossi-pass-1" });
});
test("שגיאות מסבירות את עצמן", async (t) => {
  const { signUp } = await get();
  const { base, log } = await api(t);
  await signUp(base, "dana@example.com");
  await assert.rejects(signUp(base, "dana@example.com"), { message: 'signUp(dana@example.com): 409 {"code":"EMAIL_TAKEN"}' });
  const before = log.length;
  await assert.rejects(signUp(base, "x@example.com", "short"), { message: 'signUp(x@example.com): 400 {"code":"VALIDATION_ERROR"}' });
  assert.equal(log.length, before + 1, "הרשמה שנכשלה — בלי לנסות להיכנס");
  await assert.rejects(signUp(base, "broken@example.com"), { message: 'signUp(broken@example.com): 401 {"code":"INVALID_CREDENTIALS"}' });
});
test("auth", async () => {
  const { auth } = await get();
  assert.deepEqual(auth("abc.def"), { authorization: "Bearer abc.def" });
});
