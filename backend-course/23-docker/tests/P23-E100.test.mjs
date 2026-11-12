import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { runScriptAsync } from "../../tools/shell.mjs";

async function api(t, { brokenAt } = {}) {
  const app = express();
  app.use(express.json());
  const users = new Map();
  const tasks = new Map();
  const log = [];
  app.use((req, res, next) => { log.push(`${req.method} ${req.path}`); next(); });
  app.get("/health", (req, res) => (brokenAt === "health" ? res.status(503).json({ ok: false }) : res.json({ ok: true })));
  app.post("/auth/register", (req, res) => {
    const { email, password } = req.body ?? {};
    if (users.has(email)) return res.status(409).json({ code: "EMAIL_TAKEN" });
    if (!/^smoke-.+@example\.com$/.test(email) || password !== "smoke-password-1") return res.status(400).json({});
    users.set(email, password);
    res.status(201).json({ id: users.size, email });
  });
  app.post("/auth/login", (req, res) => {
    const { email, password } = req.body ?? {};
    if (brokenAt === "login" || users.get(email) !== password) return res.status(401).json({ code: "INVALID_CREDENTIALS" });
    res.json({ accessToken: `tok.${Buffer.from(email).toString("base64url")}.sig`, refreshToken: "r", tokenType: "Bearer" });
  });
  const who = (req) => /^Bearer tok\.([\w-]+)\.sig$/.exec(req.get("authorization") ?? "")?.[1];
  app.post("/tasks", (req, res) => {
    const u = who(req);
    if (!u) return res.status(401).json({});
    if (brokenAt === "create") return res.status(500).json({});
    tasks.set(u, [...(tasks.get(u) ?? []), { id: 1, title: req.body.title }]);
    res.status(201).json({ id: 1, title: req.body.title });
  });
  app.get("/tasks", (req, res) => {
    const u = who(req);
    if (!u) return res.status(401).json({});
    res.json({ data: brokenAt === "list" ? [] : tasks.get(u) ?? [] });
  });
  const s = await new Promise((r) => { const srv = app.listen(0, "127.0.0.1", () => r(srv)); });
  t.after(() => s.close());
  return { base: `http://127.0.0.1:${s.address().port}`, log, users };
}

test("הכול עובד — ופעמיים", async (t) => {
  const { base, log, users } = await api(t);
  for (let i = 0; i < 2; i++) {
    const r = await runScriptAsync(import.meta.url, "P23-E100.sh", [base]);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(r.lines, ["✔ health", "✔ register", "✔ login", "✔ create", "✔ list"]);
  }
  assert.equal(users.size, 2, "אימייל אקראי — שתי הרשמות שונות");
  assert.deepEqual(log.slice(0, 5), ["GET /health", "POST /auth/register", "POST /auth/login", "POST /tasks", "GET /tasks"]);
});
test("צעד שנכשל ← ✘ ו־exit 1", async (t) => {
  for (const [brokenAt, done, msg] of [["health", [], /✘ health: 503/], ["login", ["✔ health", "✔ register"], /✘ login: 401/], ["create", ["✔ health", "✔ register", "✔ login"], /✘ create: 500/], ["list", ["✔ health", "✔ register", "✔ login", "✔ create"], /✘ list/]]) {
    const { base } = await api(t, { brokenAt });
    const r = await runScriptAsync(import.meta.url, "P23-E100.sh", [base]);
    assert.equal(r.status, 1, brokenAt);
    assert.deepEqual(r.lines.filter((l) => l.startsWith("✔")), done, brokenAt);
    assert.match(r.stderr, msg);
  }
});
test("בלי ארגומנט ← exit 2", async () => {
  assert.equal((await runScriptAsync(import.meta.url, "P23-E100.sh", [])).status, 2);
});
