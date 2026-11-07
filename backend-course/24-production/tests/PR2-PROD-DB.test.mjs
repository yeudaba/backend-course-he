import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { target, api } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

// פרויקט 2, שלב ז׳ — מול PostgreSQL אמיתי: ה־migration החדש, ומה קורה כששתי בקשות עם אותו מפתח מגיעות באותו רגע
const pkg = target(import.meta.url, "tasks-api/package.json");
const dist = (f) => target(import.meta.url, `tasks-api/dist/${f}`);
if (!fs.existsSync(dist("idempotency/idempotency.prisma-repository.js")) || !fs.existsSync(dist("generated/prisma/client.js"))) {
  throw new Error("לא נמצא dist/idempotency/idempotency.prisma-repository.js — הרץ npx prisma generate ואז npm run build בתיקיית הפרויקט");
}
const projectRequire = createRequire(pkg);
projectRequire("reflect-metadata");
const { Test } = projectRequire("@nestjs/testing");
const { AppModule } = projectRequire(dist("app.module.js"));
const { configureApp } = projectRequire(dist("app.setup.js"));
const { CONFIG, CLOCK } = projectRequire(dist("config.js"));
const { LOG_SINK } = projectRequire(dist("common/logger.js"));
const { PrismaService } = projectRequire(dist("prisma/prisma.service.js"));

async function start(t) {
  const db = await sandbox(t, import.meta.url);
  await db.applyMigrations(target(import.meta.url, "tasks-api/prisma/migrations"));
  const prisma = await db.prisma({ clientPath: dist("generated/prisma/client.js") });
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService).useValue(prisma)
    .overrideProvider(LOG_SINK).useValue(() => {})
    .overrideProvider(CLOCK).useValue({ now: () => new Date("2026-11-04T10:00:00.000Z") })
    .overrideProvider(CONFIG).useValue({
      jwtSecret: "test-secret-0123456789-0123456789-abcdef", accessTokenTtlSeconds: 900, refreshTokenTtlDays: 7, bcryptRounds: 4,
      logLevel: "info", authRateLimitPerMinute: 100, idempotencyTtlHours: 24,
    })
    .compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  const server = app.getHttpServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => { server.closeAllConnections?.(); await app.close(); });
  const call = api(`http://127.0.0.1:${server.address().port}`);
  const signup = async (email, extra = {}) => {
    assert.equal((await call("POST", "/auth/register", { email, password: "long-password-1", ...extra })).status, 201);
    const token = (await call("POST", "/auth/login", { email, password: "long-password-1" })).body.accessToken;
    return (method, path, body, headers = {}) => call(method, path, body, { headers: { authorization: `Bearer ${token}`, ...headers } });
  };
  return { db, call, signup };
}

test("migration: time_zone ו־idempotency_keys", async (t) => {
  const { db, signup } = await start(t);
  await signup("dana@example.com", { timeZone: "Asia/Jerusalem" });
  await signup("yossi@example.com");
  assert.deepEqual((await db.rows("SELECT email, time_zone FROM users ORDER BY id")).map((r) => r.time_zone), ["Asia/Jerusalem", "UTC"], "עמודה time_zone, ברירת מחדל UTC");
  const cols = await db.rows("SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'idempotency_keys'");
  for (const c of ["user_id", "key", "fingerprint", "status", "body", "created_at"]) {
    assert.ok(cols.some((r) => r.column_name === c), `idempotency_keys.${c}`);
  }
  const uniq = await db.rows(`SELECT pg_get_indexdef(indexrelid) AS def FROM pg_index WHERE indisunique AND indrelid = 'idempotency_keys'::regclass`);
  assert.ok(uniq.some((r) => /\(user_id, key\)/.test(r.def)), "UNIQUE (user_id, key) — זה מה שמונע כפילויות במקביל");
});

test("10 בקשות במקביל עם אותו Idempotency-Key ← משימה אחת", async (t) => {
  const { db, signup } = await start(t);
  const dana = await signup("dana@example.com");
  const yossi = await signup("yossi@example.com");
  const results = await Promise.all(Array.from({ length: 10 }, () => dana("POST", "/tasks", { title: "תשלום" }, { "Idempotency-Key": "pay-2026-11-04-a" })));
  const statuses = results.map((r) => r.status);
  assert.ok(statuses.every((s) => s === 201 || s === 409), `רק 201 (ראשונה / replay) או 409 (עדיין בטיפול): ${statuses.join(",")}`);
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM tasks"))[0].n, 1, "במסד — משימה אחת בלבד");
  const ids = new Set(results.filter((r) => r.status === 201).map((r) => r.body.id));
  assert.equal(ids.size, 1, "כל ה־201 מחזירות את אותה משימה");

  const [row] = await db.rows("SELECT k.status, k.body->>'title' AS title, u.email FROM idempotency_keys k JOIN users u ON u.id = k.user_id");
  assert.deepEqual(row, { status: 201, title: "תשלום", email: "dana@example.com" }, "התשובה נשמרה במסד, עם user_id");
  const again = await dana("POST", "/tasks", { title: "תשלום" }, { "Idempotency-Key": "pay-2026-11-04-a" });
  assert.equal(again.headers.get("idempotent-replayed"), "true");
  assert.equal((await yossi("POST", "/tasks", { title: "תשלום" }, { "Idempotency-Key": "pay-2026-11-04-a" })).status, 201);
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM tasks"))[0].n, 2, "ליוסי — משימה משלו");

  assert.equal((await dana("POST", "/tasks", { title: "x", dueDate: "2020-01-01" }, { "Idempotency-Key": "failed-key-0001" })).status, 422);
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM idempotency_keys WHERE key = 'failed-key-0001'"))[0].n, 0, "בקשה שנכשלה — המפתח שוחרר (נמחק)");
});
