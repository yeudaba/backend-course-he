import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { target, api } from "../../tools/load.mjs";

// פרויקט 2, שלב ד׳: משתמשים, JWT, refresh tokens, תפקידים — וכל משתמש רואה רק את שלו.
// נבדק הקוד המקומפל (npm run build ← dist/), עם repositories בזיכרון, שעון קבוע והגדרות של בדיקה.
const pkg = target(import.meta.url, "tasks-api/package.json");
const dist = (f) => target(import.meta.url, `tasks-api/dist/${f}`);
if (!fs.existsSync(dist("auth/auth.module.js"))) {
  throw new Error("לא נמצא dist/auth/auth.module.js — הרץ npm run build בתיקיית הפרויקט (וגם npx prisma generate)");
}
const projectRequire = createRequire(pkg);
projectRequire("reflect-metadata");
const { Test } = projectRequire("@nestjs/testing");
const bcrypt = projectRequire("bcryptjs");
const { AppModule } = projectRequire(dist("app.module.js"));
const { configureApp } = projectRequire(dist("app.setup.js"));
const { CONFIG, CLOCK } = projectRequire(dist("config.js"));
const { TASKS_REPOSITORY } = projectRequire(dist("tasks/tasks.tokens.js"));
const { InMemoryTasksRepository } = projectRequire(dist("tasks/tasks.repository.js"));
const { USERS_REPOSITORY, InMemoryUsersRepository } = projectRequire(dist("users/users.repository.js"));
const { REFRESH_TOKENS_REPOSITORY, InMemoryRefreshTokensRepository } = projectRequire(dist("auth/refresh-tokens.repository.js"));
const { PrismaService } = projectRequire(dist("prisma/prisma.service.js"));

const TEST_CONFIG = { jwtSecret: "test-secret-0123456789-0123456789-abcdef", accessTokenTtlSeconds: 900, refreshTokenTtlDays: 7, bcryptRounds: 4 };

async function start(t) {
  const clock = { now: new Date("2026-11-04T10:00:00.000Z") };
  const users = new InMemoryUsersRepository();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(TASKS_REPOSITORY).useValue(new InMemoryTasksRepository())
    .overrideProvider(USERS_REPOSITORY).useValue(users)
    .overrideProvider(REFRESH_TOKENS_REPOSITORY).useValue(new InMemoryRefreshTokensRepository())
    .overrideProvider(CLOCK).useValue({ now: () => clock.now })
    .overrideProvider(CONFIG).useValue(TEST_CONFIG)
    .overrideProvider(PrismaService).useValue({ $disconnect: async () => {} })
    .compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  const server = app.getHttpServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => { server.closeAllConnections?.(); await app.close(); });
  const call = api(`http://127.0.0.1:${server.address().port}`);
  const as = (token) => (method, path, body) => call(method, path, body, { headers: { authorization: `Bearer ${token}` } });
  const signup = async (email, password = "long-password-1") => {
    assert.equal((await call("POST", "/auth/register", { email, password })).status, 201, `הרשמה של ${email}`);
    const res = await call("POST", "/auth/login", { email, password });
    assert.equal(res.status, 200, `כניסה של ${email}`);
    return res.body;
  };
  return { call, as, signup, clock, users };
}
const payload = (jwt) => JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());

test("הרשמה", async (t) => {
  const { call, users } = await start(t);
  let res = await call("POST", "/auth/register", { email: "  Dana@Example.COM ", password: "long-password-1" });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, email: "dana@example.com", role: "user", createdAt: "2026-11-04T10:00:00.000Z" }, "אימייל באותיות קטנות, בלי passwordHash");
  const [stored] = await users.list();
  assert.match(stored.passwordHash, /^\$2[aby]\$04\$/, "במאגר נשמר hash של bcrypt (עם rounds מה־CONFIG)");
  assert.ok(await bcrypt.compare("long-password-1", stored.passwordHash));

  res = await call("POST", "/auth/register", { email: "DANA@example.com", password: "other-password" });
  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, "EMAIL_TAKEN");

  res = await call("POST", "/auth/register", { email: "evil@example.com", password: "long-password-1", role: "admin" });
  assert.equal(res.status, 400, "role בגוף הבקשה ← 400 (mass assignment)");
  assert.equal(res.body.error.code, "VALIDATION_ERROR");

  res = await call("POST", "/auth/register", { email: "not-an-email", password: "short" });
  assert.deepEqual(res.body.error.details.map((d) => d.path).sort(), ["body.email", "body.password"]);
  res = await call("POST", "/auth/register", { email: "long@example.com", password: "א".repeat(37) });
  assert.equal(res.status, 400, "37 אותיות בעברית = 74 בתים — מעל 72");
});

test("כניסה ו־access token", async (t) => {
  const { call, as, signup, clock } = await start(t);
  const tokens = await signup("dana@example.com");
  assert.equal(tokens.tokenType, "Bearer");
  assert.equal(tokens.expiresIn, 900);
  const p = payload(tokens.accessToken);
  assert.equal(p.sub, 1);
  assert.equal(p.role, "user");
  assert.equal(p.exp - p.iat, 900, "תוקף 15 דקות");
  assert.equal(p.iat, Date.parse("2026-11-04T10:00:00Z") / 1000, "iat לפי ה־CLOCK");
  assert.equal(p.passwordHash, undefined);

  const wrong = await call("POST", "/auth/login", { email: "dana@example.com", password: "wrong-password" });
  const unknown = await call("POST", "/auth/login", { email: "nobody@example.com", password: "wrong-password" });
  assert.equal(wrong.status, 401);
  assert.deepEqual(wrong.body, unknown.body, "אותה תשובה בדיוק — לא מגלים אם האימייל רשום");
  assert.equal(wrong.body.error.code, "INVALID_CREDENTIALS");

  assert.deepEqual((await as(tokens.accessToken)("GET", "/auth/me")).body, { id: 1, email: "dana@example.com", role: "user", createdAt: "2026-11-04T10:00:00.000Z" });
  let res = await call("GET", "/auth/me");
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, "UNAUTHORIZED");
  res = await call("GET", "/tasks", undefined, { headers: { authorization: `bearer ${tokens.accessToken}` } });
  assert.equal(res.status, 200, "Bearer בלי תלות באותיות");
  res = await as("abc.def.ghi")("GET", "/tasks");
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, "INVALID_TOKEN");

  const [h, , s] = tokens.accessToken.split(".");
  const forged = `${h}.${Buffer.from(JSON.stringify({ ...p, role: "admin" })).toString("base64url")}.${s}`;
  assert.equal((await as(forged)("GET", "/users")).status, 401, "payload ששונה ← החתימה לא מתאימה");

  clock.now = new Date("2026-11-04T10:14:59.000Z");
  assert.equal((await as(tokens.accessToken)("GET", "/tasks")).status, 200);
  clock.now = new Date("2026-11-04T10:15:00.000Z");
  res = await as(tokens.accessToken)("GET", "/tasks");
  assert.equal(res.status, 401, "אחרי 15 דקות");
  assert.equal(res.body.error.code, "INVALID_TOKEN");
  assert.equal(res.body.error.message, "פג תוקף הטוקן");
  assert.equal((await call("GET", "/health")).status, 200, "health פתוח");
});

test("כל משתמש רואה רק את המשימות שלו", async (t) => {
  const { signup, as } = await start(t);
  const dana = as((await signup("dana@example.com")).accessToken);
  const yossi = as((await signup("yossi@example.com")).accessToken);
  let res = await dana("POST", "/tasks", { title: "של דנה", priority: "high" });
  assert.equal(res.status, 201);
  assert.equal(res.body.ownerId, undefined, "ownerId לא חלק מה־API");
  await dana("POST", "/tasks", { title: "עוד של דנה", status: "done" });
  await yossi("POST", "/tasks", { title: "של יוסי" });

  assert.deepEqual((await dana("GET", "/tasks")).body.data.map((x) => x.title).sort(), ["עוד של דנה", "של דנה"]);
  assert.deepEqual((await yossi("GET", "/tasks")).body.data.map((x) => x.id), [3]);
  for (const [method, body] of [["GET"], ["PATCH", { status: "done" }], ["DELETE"]]) {
    res = await yossi(method, "/tasks/1", body);
    assert.equal(res.status, 404, `${method} למשימה של מישהו אחר ← 404`);
    assert.equal(res.body.error.code, "TASK_NOT_FOUND");
  }
  assert.equal((await dana("GET", "/tasks/1")).body.status, "todo", "המשימה של דנה לא השתנתה");
  assert.deepEqual((await yossi("GET", "/tasks/stats")).body, { total: 1, byStatus: { todo: 1, in_progress: 0, done: 0 }, overdue: 0 });
  assert.deepEqual((await dana("GET", "/tasks/stats")).body.byStatus, { todo: 1, in_progress: 0, done: 1 });
  assert.equal((await dana("DELETE", "/tasks/1")).status, 204);
});

test("refresh tokens: rotation, שימוש חוזר ויציאה", async (t) => {
  const { call, signup, clock, as } = await start(t);
  const first = await signup("dana@example.com");
  assert.ok(first.refreshToken.length >= 40, "refresh token אקראי וארוך");
  assert.equal(first.refreshToken.split(".").length, 1, "refresh token אטום — לא JWT");

  clock.now = new Date("2026-11-04T10:20:00.000Z");
  let res = await call("POST", "/auth/refresh", { refreshToken: first.refreshToken });
  assert.equal(res.status, 200);
  const second = res.body;
  assert.notEqual(second.refreshToken, first.refreshToken, "זוג חדש");
  assert.equal((await as(second.accessToken)("GET", "/tasks")).status, 200, "ה־access token החדש עובד");

  res = await call("POST", "/auth/refresh", { refreshToken: first.refreshToken });
  assert.equal(res.status, 401, "refresh token שכבר הוחלף לא עובד שוב");
  assert.equal(res.body.error.code, "INVALID_REFRESH_TOKEN");
  res = await call("POST", "/auth/refresh", { refreshToken: second.refreshToken });
  assert.equal(res.status, 401, "שימוש חוזר בטוקן ישן ← כל הטוקנים של המשתמש בוטלו");

  const third = (await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" })).body;
  assert.equal((await call("POST", "/auth/logout", { refreshToken: third.refreshToken })).status, 204);
  assert.equal((await call("POST", "/auth/refresh", { refreshToken: third.refreshToken })).status, 401, "אחרי יציאה");
  assert.equal((await call("POST", "/auth/logout", { refreshToken: "nonsense" })).status, 204, "יציאה עם טוקן לא מוכר — עדיין 204");

  const fourth = (await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" })).body;
  clock.now = new Date("2026-11-11T10:20:00.000Z");
  assert.equal((await call("POST", "/auth/refresh", { refreshToken: fourth.refreshToken })).status, 401, "אחרי 7 ימים");
  assert.equal((await call("POST", "/auth/refresh", {})).status, 400);
});

test("תפקידים: /users רק ל־admin", async (t) => {
  const { call, signup, as, users } = await start(t);
  const dana = as((await signup("dana@example.com")).accessToken);
  let res = await dana("GET", "/users");
  assert.equal(res.status, 403);
  assert.equal(res.body.error.code, "FORBIDDEN");
  await users.insert({ email: "admin@example.com", passwordHash: await bcrypt.hash("admin-password-1", 4), role: "admin", createdAt: "2026-11-01T00:00:00.000Z" });
  const admin = (await call("POST", "/auth/login", { email: "admin@example.com", password: "admin-password-1" })).body;
  assert.equal(payload(admin.accessToken).role, "admin");
  res = await as(admin.accessToken)("GET", "/users");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.map((u) => u.email), ["dana@example.com", "admin@example.com"]);
  assert.ok(res.body.every((u) => !("passwordHash" in u)), "בלי passwordHash");
  assert.equal((await call("GET", "/users")).status, 401, "בלי טוקן ← 401 (לא 403)");
});

test("Swagger: Bearer auth", async (t) => {
  const { call } = await start(t);
  const doc = (await call("GET", "/docs-json")).body;
  assert.equal(doc.components?.securitySchemes?.bearer?.scheme, "bearer", "addBearerAuth()");
  assert.ok(doc.paths["/auth/login"]?.post, "POST /auth/login מתועד");
  assert.ok(doc.paths["/tasks"].get.security, "/tasks מסומן כדורש טוקן");
});
