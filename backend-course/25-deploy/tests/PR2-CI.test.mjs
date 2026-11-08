import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { load as parseYaml } from "js-yaml";
import { target, api } from "../../tools/load.mjs";

// פרויקט 2, שלב ח׳: CI/CD. נבדקים: ה־workflow (מבנה ובטיחות), סקריפט בדיקת העשן (מול שרת מדומה),
// /health · /ready · /version, הגדרות הפרודקשן, ו־npm run typecheck.
const project = (f) => target(import.meta.url, `tasks-api/${f}`);
const dist = (f) => project(`dist/${f}`);
const workflowFile = project(".github/workflows/ci.yml");

function loadWorkflow() {
  assert.ok(fs.existsSync(workflowFile), "לא נמצא .github/workflows/ci.yml");
  return parseYaml(fs.readFileSync(workflowFile, "utf8"));
}
const stepsOf = (job) => (job.steps ?? []).map((s) => ({ ...s, text: `${s.uses ?? ""} ${s.run ?? ""}` }));
const indexOf = (steps, re) => steps.findIndex((s) => re.test(s.text));

test("workflow: מתי רץ, והרשאות", () => {
  const wf = loadWorkflow();
  const on = wf.on ?? wf[true]; // YAML 1.1: המילה on יכולה להיקרא כ־true
  assert.ok(on?.push, "on.push");
  assert.ok(on?.pull_request, "on.pull_request — בדיקות גם על pull requests");
  assert.ok([on.push.branches].flat().includes("main"), "push רק ל־main");
  assert.equal(wf.permissions?.contents, "read", "permissions: contents: read — מינימום הרשאות ל־GITHUB_TOKEN");
});

test("workflow: job של בדיקות עם PostgreSQL", () => {
  const wf = loadWorkflow();
  const job = Object.values(wf.jobs).find((j) => j.services && Object.values(j.services).some((s) => /^postgres:18/.test(s.image)));
  assert.ok(job, "job עם services: postgres:18-alpine");
  const pg = Object.values(job.services).find((s) => /^postgres/.test(s.image));
  assert.match(String(pg.options ?? ""), /--health-cmd/, "healthcheck ל־postgres (אחרת הבדיקות מתחילות לפני שהמסד מוכן)");
  const steps = stepsOf(job);
  const setup = steps.find((s) => /actions\/setup-node@/.test(s.uses ?? ""));
  assert.equal(String(setup?.with?.["node-version"]), "24", "setup-node עם node-version: 24");
  assert.ok(steps.every((s) => !/npm install\b/.test(s.run ?? "")), "npm ci ולא npm install (בדיוק מה שב־lock)");
  const order = ["npm ci", "prisma generate", "npm test", "prisma migrate deploy", "test:int"].map((name) => [name, indexOf(steps, new RegExp(name.replace(" ", "\\s+")))]);
  for (const [name, i] of order) assert.ok(i >= 0, `צעד: ${name}`);
  for (let k = 1; k < order.length; k++) {
    if (order[k][0] === "npm test") continue;
    assert.ok(order[k][1] > order[k - 1][1] || order[k - 1][0] === "npm test", `${order[k - 1][0]} לפני ${order[k][0]}`);
  }
  assert.ok(indexOf(steps, /prisma\s+migrate\s+deploy/) < indexOf(steps, /test:int/), "migrate deploy לפני test:int");
  assert.ok(steps.some((s) => /\btypecheck\b|tsc\b/.test(s.run ?? "")), "typecheck");
});

test("workflow: deploy רק אחרי בדיקות, רק מ־main, ובלי סודות בקובץ", () => {
  const wf = loadWorkflow();
  const text = fs.readFileSync(workflowFile, "utf8");
  const [name, job] = Object.entries(wf.jobs).find(([, j]) => stepsOf(j).some((s) => /RENDER_DEPLOY_HOOK_URL|deploy hook/i.test(`${s.text} ${JSON.stringify(s.env ?? {})}`))) ?? [];
  assert.ok(job, "job של deploy (עם RENDER_DEPLOY_HOOK_URL)");
  const needs = [job.needs ?? []].flat();
  const testJobs = Object.entries(wf.jobs).filter(([, j]) => j.services).map(([n]) => n);
  assert.ok(testJobs.every((n) => needs.includes(n)), `${name}.needs כולל את ${testJobs.join(", ")} — אחרת deploy רץ במקביל לבדיקות`);
  assert.match(String(job.if ?? ""), /refs\/heads\/main/, "if: רק ב־main");
  assert.match(String(job.if ?? ""), /push/, "if: רק ב־push (לא ב־pull request)");
  assert.match(text, /secrets\.DATABASE_URL/, "המסד של הפרודקשן — מ־secrets.DATABASE_URL");
  assert.match(text, /secrets\.RENDER_DEPLOY_HOOK_URL/, "ה־deploy hook — מ־secrets");
  assert.doesNotMatch(text, /api\.render\.com\/deploy\/srv-/, "כתובת deploy hook אמיתית בקובץ = כל מי שרואה את ה־repo יכול לעשות deploy");
  assert.doesNotMatch(text, /postgres(ql)?:\/\/[^@\s]+:[^@\s]+@(?!localhost)/, "סיסמה של מסד אמיתי בקובץ");
  for (const s of stepsOf(job)) assert.doesNotMatch(s.run ?? "", /echo[^\n]*\$\{\{\s*secrets\./, "echo של secret");
  const steps = stepsOf(job);
  assert.ok(indexOf(steps, /migrate\s+deploy/) >= 0 && indexOf(steps, /migrate\s+deploy/) < indexOf(steps, /RENDER_DEPLOY_HOOK_URL/), "migrations לפני ה־deploy");
  assert.ok(indexOf(steps, /smoke/) > indexOf(steps, /RENDER_DEPLOY_HOOK_URL/), "בדיקת עשן אחרי ה־deploy");
});

// ---------- smoke.mjs מול שרת מדומה ----------
function fakeServer(t, { commit, readyAfter = 0, versionAfter = 0 }) {
  let calls = 0;
  const server = http.createServer((req, res) => {
    calls++;
    res.setHeader("content-type", "application/json");
    if (req.url === "/version") {
      if (calls <= versionAfter) return res.writeHead(503).end("{}"); // "השרת מתעורר"
      return res.end(JSON.stringify({ name: "tasks-api", version: "1.0.0", commit }));
    }
    if (req.url === "/ready") return calls > readyAfter ? res.end('{"ok":true}') : res.writeHead(503).end("{}");
    res.writeHead(404).end("{}");
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => { t.after(() => server.close()); r(`http://127.0.0.1:${server.address().port}`); }));
}
function smoke(env) {
  const file = project("scripts/smoke.mjs");
  assert.ok(fs.existsSync(file), "לא נמצא scripts/smoke.mjs");
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [file], { env: { ...process.env, INTERVAL_SECONDS: "0.05", TIMEOUT_SECONDS: "3", ...env }, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    const timer = setTimeout(() => p.kill(), 15000);
    p.on("exit", (code) => { clearTimeout(timer); resolve({ code, out }); });
  });
}

test("smoke.mjs: מחכה לגרסה החדשה ולמוכנות", async (t) => {
  const sha = "a".repeat(40);
  const base = await fakeServer(t, { commit: sha, versionAfter: 3, readyAfter: 6 });
  const r = await smoke({ BASE_URL: base, EXPECT_COMMIT: sha });
  assert.equal(r.code, 0, `צריך להצליח אחרי כמה ניסיונות (503 בהתחלה):\n${r.out}`);
});
test("smoke.mjs: גרסה ישנה ← נכשל", async (t) => {
  const base = await fakeServer(t, { commit: "b".repeat(40) });
  const r = await smoke({ BASE_URL: base, EXPECT_COMMIT: "a".repeat(40), TIMEOUT_SECONDS: "1" });
  assert.notEqual(r.code, 0, "commit אחר רץ — ה־deploy לא הגיע (או נכשל). exit code שונה מ־0");
});
test("smoke.mjs: שרת שלא עונה ← נכשל", async () => {
  const r = await smoke({ BASE_URL: "http://127.0.0.1:9", EXPECT_COMMIT: "a".repeat(40), TIMEOUT_SECONDS: "1" });
  assert.notEqual(r.code, 0);
});

// ---------- האפליקציה ----------
test("/health · /ready · /version", async (t) => {
  for (const f of ["app.module.js", "health.controller.js", "server-config.js"]) {
    assert.ok(fs.existsSync(dist(f)), `לא נמצא dist/${f} — הרץ npx prisma generate ואז npm run build`);
  }
  const req = createRequire(project("package.json"));
  req("reflect-metadata");
  const { Test } = req("@nestjs/testing");
  const { AppModule } = req(dist("app.module.js"));
  const { configureApp } = req(dist("app.setup.js"));
  const { CONFIG } = req(dist("config.js"));
  const { PrismaService } = req(dist("prisma/prisma.service.js"));
  const { BUILD_INFO, readBuildInfo } = req(dist("health.controller.js"));
  const info = readBuildInfo({ GIT_COMMIT: "abc1234" });
  assert.equal(info.commit, "abc1234", "readBuildInfo: commit מ־GIT_COMMIT");
  assert.equal(readBuildInfo({ RENDER_GIT_COMMIT: "def5678" }).commit, "def5678", "…או מ־RENDER_GIT_COMMIT (Render)");
  assert.equal(readBuildInfo({}).commit, "dev");
  assert.equal(info.version, JSON.parse(fs.readFileSync(project("package.json"), "utf8")).version, "version מ־package.json");

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(CONFIG).useValue({ jwtSecret: "x".repeat(40), accessTokenTtlSeconds: 900, refreshTokenTtlDays: 7, bcryptRounds: 4, logLevel: "error", authRateLimitPerMinute: 10, idempotencyTtlHours: 24 })
    .overrideProvider(PrismaService).useValue({ $queryRaw: () => Promise.reject(new Error("db down")), $disconnect: async () => {} })
    .overrideProvider(BUILD_INFO).useValue({ ...info, commit: "abc1234" })
    .compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  const server = app.getHttpServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => { server.closeAllConnections?.(); await app.close(); });
  const call = api(`http://127.0.0.1:${server.address().port}`);
  assert.equal((await call("GET", "/health")).status, 200, "/health בלי התחברות");
  const ready = await call("GET", "/ready");
  assert.equal(ready.status, 503, "/ready ← 503 כשהמסד לא זמין");
  assert.equal(ready.body.error.code, "NOT_READY");
  const v = await call("GET", "/version");
  assert.equal(v.status, 200);
  assert.equal(v.body.commit, "abc1234");
});

test("הגדרות פרודקשן", () => {
  const req = createRequire(project("package.json"));
  const { loadServerConfig } = req(dist("server-config.js"));
  assert.deepEqual(loadServerConfig({}).corsOrigins, ["http://localhost:5500"]);
  assert.equal(loadServerConfig({ PORT: "10000" }).port, 10000, "PORT מה־env (Render קובע 10000)");
  const ok = loadServerConfig({ NODE_ENV: "production", DATABASE_URL: "postgresql://x", CORS_ORIGINS: "https://tasks.example.com", TRUST_PROXY: "1" });
  assert.equal(ok.production, true);
  assert.equal(ok.trustProxy, 1);
  assert.throws(() => loadServerConfig({ NODE_ENV: "production", DATABASE_URL: "postgresql://x" }), /CORS_ORIGINS/, "פרודקשן בלי CORS_ORIGINS — לא עולה");
  assert.throws(() => loadServerConfig({ NODE_ENV: "production", CORS_ORIGINS: "https://a.example.com" }), /DATABASE_URL/);
  assert.throws(() => loadServerConfig({ NODE_ENV: "production", DATABASE_URL: "postgresql://x", CORS_ORIGINS: "http://a.example.com" }), /https/, "פרודקשן: רק https");
  assert.throws(() => loadServerConfig({ NODE_ENV: "production", DATABASE_URL: "postgresql://x", CORS_ORIGINS: "*" }), /https/);
  const { pgConnectionOptions } = req(dist("prisma/pg-options.js"));
  assert.deepEqual(pgConnectionOptions("postgresql://u:p@ep-1.neon.tech/db?sslmode=require"), { connectionString: "postgresql://u:p@ep-1.neon.tech/db", ssl: { rejectUnauthorized: true } }, "sslmode=require ← TLS עם בדיקת תעודה");
  assert.deepEqual(pgConnectionOptions("postgresql://u:p@localhost:5432/db"), { connectionString: "postgresql://u:p@localhost:5432/db" });
});

test("Dockerfile: healthcheck לפי PORT", () => {
  const text = fs.readFileSync(project("Dockerfile"), "utf8");
  assert.match(text, /HEALTHCHECK[\s\S]*\$\{?PORT/, "ה־HEALTHCHECK משתמש ב־PORT (לא 3000 קבוע)");
});

test("npm run typecheck עובר (כולל בדיקות ו־seed)", () => {
  const tsc = process.env.TSC_PATH || createRequire(project("package.json")).resolve("typescript/bin/tsc");
  const r = spawnSync(process.execPath, [tsc, "--noEmit", "-p", "tsconfig.json"], { cwd: project(""), encoding: "utf8", timeout: 120000 });
  assert.equal(r.status, 0, `tsc --noEmit נכשל — זה בדיוק מה שה־CI יריץ:\n${r.stdout.split("\n").slice(0, 8).join("\n")}`);
});
