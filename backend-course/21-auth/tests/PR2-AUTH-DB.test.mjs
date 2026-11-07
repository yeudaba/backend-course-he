import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { target, api } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

// פרויקט 2, שלב ד׳ — מול PostgreSQL אמיתי: ה־migration החדש, ה־repositories של Prisma, ומה באמת נשמר בטבלאות
const pkg = target(import.meta.url, "tasks-api/package.json");
const dist = (f) => target(import.meta.url, `tasks-api/dist/${f}`);
if (!fs.existsSync(dist("auth/auth.module.js")) || !fs.existsSync(dist("generated/prisma/client.js"))) {
  throw new Error("לא נמצא dist/ — הרץ npx prisma generate ואז npm run build בתיקיית הפרויקט");
}
const projectRequire = createRequire(pkg);
projectRequire("reflect-metadata");
const { Test } = projectRequire("@nestjs/testing");
const { AppModule } = projectRequire(dist("app.module.js"));
const { configureApp } = projectRequire(dist("app.setup.js"));
const { CONFIG, CLOCK } = projectRequire(dist("config.js"));
const { PrismaService } = projectRequire(dist("prisma/prisma.service.js"));

async function start(t) {
  const db = await sandbox(t, import.meta.url);
  await db.applyMigrations(target(import.meta.url, "tasks-api/prisma/migrations"));
  const prisma = await db.prisma({ clientPath: dist("generated/prisma/client.js") });
  const clock = { now: new Date("2026-11-04T10:00:00.000Z") };
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService).useValue(prisma)
    .overrideProvider(CLOCK).useValue({ now: () => clock.now })
    .overrideProvider(CONFIG).useValue({ jwtSecret: "test-secret-0123456789-0123456789-abcdef", accessTokenTtlSeconds: 900, refreshTokenTtlDays: 7, bcryptRounds: 4 })
    .compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  const server = app.getHttpServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => { server.closeAllConnections?.(); await app.close(); });
  const call = api(`http://127.0.0.1:${server.address().port}`);
  const as = (token) => (method, path, body) => call(method, path, body, { headers: { authorization: `Bearer ${token}` } });
  return { db, call, as, clock };
}

test("משתמשים ו־refresh tokens במסד", async (t) => {
  const { db, call } = await start(t);
  assert.equal((await call("POST", "/auth/register", { email: "dana@example.com", password: "long-password-1" })).status, 201);
  assert.equal((await call("POST", "/auth/register", { email: "dana@example.com", password: "long-password-2" })).status, 409, "unique על email");
  const [user] = await db.rows("SELECT id, email, role::text, password_hash FROM users");
  assert.equal(user.email, "dana@example.com");
  assert.equal(user.role, "user");
  assert.match(user.password_hash, /^\$2[aby]\$04\$.{53}$/, "בעמודה password_hash — רק hash");

  const tokens = (await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" })).body;
  const [rt] = await db.rows("SELECT user_id, token_hash, expires_at = '2026-11-11T10:00:00Z'::timestamptz AS expires_ok, revoked_at FROM refresh_tokens");
  assert.equal(rt.user_id, user.id);
  assert.equal(rt.token_hash, createHash("sha256").update(tokens.refreshToken).digest("hex"), "במסד — SHA-256 של הטוקן, לא הטוקן עצמו");
  assert.equal(rt.expires_ok, true, "תוקף 7 ימים");
  assert.equal(rt.revoked_at, null);

  assert.equal((await call("POST", "/auth/refresh", { refreshToken: tokens.refreshToken })).status, 200);
  const rows = await db.rows("SELECT revoked_at IS NOT NULL AS revoked FROM refresh_tokens ORDER BY id");
  assert.deepEqual(rows.map((r) => r.revoked), [true, false], "הישן בוטל, נוצר חדש");
  assert.equal((await call("POST", "/auth/refresh", { refreshToken: tokens.refreshToken })).status, 401);
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM refresh_tokens WHERE revoked_at IS NULL"))[0].n, 0, "שימוש חוזר ← הכול בוטל");
});

test("משימות במסד — עם owner_id", async (t) => {
  const { db, call, as } = await start(t);
  const login = async (email) => {
    await call("POST", "/auth/register", { email, password: "long-password-1" });
    return as((await call("POST", "/auth/login", { email, password: "long-password-1" })).body.accessToken);
  };
  const dana = await login("dana@example.com");
  const yossi = await login("yossi@example.com");
  assert.equal((await dana("POST", "/tasks", { title: "של דנה", dueDate: "2026-11-01" })).status, 422, "כללי שלב א׳ עדיין עובדים");
  await dana("POST", "/tasks", { title: "של דנה", priority: "high" });
  await dana("POST", "/tasks", { title: "עוד של דנה" });
  await yossi("POST", "/tasks", { title: "של יוסי" });

  const owners = await db.rows("SELECT t.title, u.email FROM tasks t JOIN users u ON u.id = t.owner_id ORDER BY t.id");
  assert.deepEqual(owners.map((r) => r.email), ["dana@example.com", "dana@example.com", "yossi@example.com"]);
  assert.deepEqual((await yossi("GET", "/tasks")).body.meta.total, 1);
  assert.equal((await yossi("PATCH", "/tasks/1", { title: "נפרץ" })).status, 404);
  assert.equal((await yossi("DELETE", "/tasks/1")).status, 404);
  assert.equal((await db.rows("SELECT title FROM tasks WHERE id = 1"))[0].title, "של דנה", "לא השתנה במסד");
  assert.equal((await dana("PATCH", "/tasks/1", { status: "done" })).body.status, "done");
  assert.deepEqual((await dana("GET", "/tasks/stats")).body, { total: 2, byStatus: { todo: 1, in_progress: 0, done: 1 }, overdue: 0 });
  assert.equal((await dana("GET", "/tasks?q=יוסי")).body.meta.total, 0, "חיפוש לא חוצה משתמשים");

  await db.query("DELETE FROM users WHERE email = 'dana@example.com'");
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM tasks"))[0].n, 1, "ON DELETE CASCADE: המשימות של דנה נמחקו איתה");
});
