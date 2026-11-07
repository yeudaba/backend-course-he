import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { target, api } from "../../tools/load.mjs";

// פרויקט 2, שלב ז׳: request ID, לוגים מובנים, Idempotency-Key, הגבלת קצב ואזורי זמן.
// נבדק הקוד המקומפל (npm run build ← dist/), עם repositories בזיכרון, שעון קבוע, והלוגים נאספים למערך.
const pkg = target(import.meta.url, "tasks-api/package.json");
const dist = (f) => target(import.meta.url, `tasks-api/dist/${f}`);
for (const f of ["common/logger.js", "common/request-id.middleware.js", "idempotency/idempotency.repository.js", "auth/auth-rate-limit.guard.js"]) {
  if (!fs.existsSync(dist(f))) throw new Error(`לא נמצא dist/${f} — בדוק את שמות הקבצים (שיעור 5) והרץ npm run build בתיקיית הפרויקט`);
}
const projectRequire = createRequire(pkg);
projectRequire("reflect-metadata");
const { Test } = projectRequire("@nestjs/testing");
const { AppModule } = projectRequire(dist("app.module.js"));
const { configureApp } = projectRequire(dist("app.setup.js"));
const { CONFIG, CLOCK } = projectRequire(dist("config.js"));
const { TASKS_REPOSITORY } = projectRequire(dist("tasks/tasks.tokens.js"));
const { InMemoryTasksRepository } = projectRequire(dist("tasks/tasks.repository.js"));
const { USERS_REPOSITORY, InMemoryUsersRepository } = projectRequire(dist("users/users.repository.js"));
const { REFRESH_TOKENS_REPOSITORY, InMemoryRefreshTokensRepository } = projectRequire(dist("auth/refresh-tokens.repository.js"));
const { IDEMPOTENCY_REPOSITORY, InMemoryIdempotencyRepository } = projectRequire(dist("idempotency/idempotency.repository.js"));
const { LOG_SINK, AppLogger } = projectRequire(dist("common/logger.js"));
const { PrismaService } = projectRequire(dist("prisma/prisma.service.js"));

const TEST_CONFIG = {
  jwtSecret: "test-secret-0123456789-0123456789-abcdef", accessTokenTtlSeconds: 900, refreshTokenTtlDays: 7, bcryptRounds: 4,
  logLevel: "info", authRateLimitPerMinute: 10, idempotencyTtlHours: 24,
};

async function start(t, config = {}) {
  const clock = { now: new Date("2026-11-04T10:00:00.000Z") };
  const lines = [];
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(TASKS_REPOSITORY).useValue(new InMemoryTasksRepository())
    .overrideProvider(USERS_REPOSITORY).useValue(new InMemoryUsersRepository())
    .overrideProvider(REFRESH_TOKENS_REPOSITORY).useValue(new InMemoryRefreshTokensRepository())
    .overrideProvider(IDEMPOTENCY_REPOSITORY).useValue(new InMemoryIdempotencyRepository())
    .overrideProvider(LOG_SINK).useValue((line) => lines.push(line))
    .overrideProvider(CLOCK).useValue({ now: () => clock.now })
    .overrideProvider(CONFIG).useValue({ ...TEST_CONFIG, ...config })
    .overrideProvider(PrismaService).useValue({ $disconnect: async () => {} })
    .compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  const server = app.getHttpServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => { server.closeAllConnections?.(); await app.close(); });
  const call = api(`http://127.0.0.1:${server.address().port}`);
  const as = (token) => (method, path, body, headers = {}) => call(method, path, body, { headers: { authorization: `Bearer ${token}`, ...headers } });
  const signup = async (email, extra = {}) => {
    assert.equal((await call("POST", "/auth/register", { email, password: "long-password-1", ...extra })).status, 201, `הרשמה של ${email}`);
    const res = await call("POST", "/auth/login", { email, password: "long-password-1" });
    assert.equal(res.status, 200, `כניסה של ${email}`);
    return as(res.body.accessToken);
  };
  // כל שורה בלוג חייבת להיות JSON תקין — אחרת כלי איסוף לוגים לא יבינו אותה
  const logs = () => lines.map((l) => {
    try { return JSON.parse(l); } catch { assert.fail(`שורת לוג שאינה JSON: ${l.slice(0, 120)}`); }
  });
  return { app, call, as, signup, clock, lines, logs };
}

test("X-Request-Id", async (t) => {
  const { call } = await start(t);
  const a = await call("GET", "/health");
  const b = await call("GET", "/health");
  assert.match(a.headers.get("x-request-id") ?? "", /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, "בלי header מהלקוח ← UUID חדש (randomUUID)");
  assert.notEqual(a.headers.get("x-request-id"), b.headers.get("x-request-id"), "מזהה אחר לכל בקשה");
  const own = await call("GET", "/health", undefined, { headers: { "X-Request-Id": "web-7f3a.retry_2" } });
  assert.equal(own.headers.get("x-request-id"), "web-7f3a.retry_2", "מזהה תקין מהלקוח ← אותו מזהה בחזרה");
  for (const bad of ["has spaces", "x".repeat(65), "a\"}{\"level\":\"error"]) {
    const res = await call("GET", "/health", undefined, { headers: { "X-Request-Id": bad } });
    assert.match(res.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/, `מזהה לא תקין (${bad.slice(0, 20)}…) ← מוחלף ב־UUID`);
  }
  assert.ok((await call("GET", "/nope")).headers.get("x-request-id"), "גם ב־404");
  assert.ok((await call("POST", "/auth/login", undefined, { raw: "{bad" })).headers.get("x-request-id"), "גם כשה־JSON שבור (INVALID_JSON)");
});

test("לוג JSON לכל בקשה", async (t) => {
  const { call, signup, logs } = await start(t);
  const dana = await signup("dana@example.com");
  const res = await dana("GET", "/tasks?q=secret-search&page=1", undefined, { "X-Request-Id": "trace-me-1" });
  assert.equal(res.status, 200);
  const mine = logs().filter((l) => l.requestId === "trace-me-1");
  assert.equal(mine.length, 1, "בדיוק שורת request אחת לבקשה (עם ה־requestId שלה)");
  const [line] = mine;
  assert.equal(line.msg, "request");
  assert.equal(line.level, "info");
  assert.equal(line.time, "2026-11-04T10:00:00.000Z", "time — מה־CLOCK, בפורמט ISO");
  assert.equal(line.method, "GET");
  assert.equal(line.path, "/tasks", "path בלי query string");
  assert.equal(line.status, 200);
  assert.equal(line.userId, 1, "userId של המשתמש המחובר");
  assert.equal(typeof line.durationMs, "number");
  assert.ok(!JSON.stringify(logs()).includes("secret-search"), "ה־query לא נכתב ללוג");

  const missing = await dana("GET", "/tasks/999");
  assert.equal(missing.status, 404);
  const l404 = logs().find((l) => l.requestId === missing.headers.get("x-request-id"));
  assert.equal(l404?.level, "warn", "4xx ← warn");
  assert.equal(l404?.status, 404);
  const anonId = (await call("GET", "/nothing-here")).headers.get("x-request-id");
  const anon = logs().find((l) => l.requestId === anonId);
  assert.ok(anon && !("userId" in anon), "בלי משתמש — בלי userId");
  const healthId = (await call("GET", "/health")).headers.get("x-request-id");
  assert.ok(!logs().some((l) => l.requestId === healthId), "GET /health מוצלח — debug (לא נכתב ב־LOG_LEVEL=info): ה־healthcheck של Docker רץ כל 5 שניות");

  const all = JSON.stringify(logs());
  assert.ok(!all.includes("long-password-1"), "סיסמה לא מופיעה בלוגים");
  assert.ok(!all.includes("eyJ"), "JWT לא מופיע בלוגים");
});

test("AppLogger: redact ו־LOG_LEVEL", async (t) => {
  const { app, logs } = await start(t, { logLevel: "warn" });
  const logger = app.get(AppLogger);
  logger.info("לא אמור להיכתב");
  logger.warn("נכתב", { user: { email: "dana@example.com", password: "p4ss", refreshToken: "rt-123" }, headers: { Authorization: "Bearer abc" } });
  const out = logs();
  assert.ok(!out.some((l) => l.msg === "לא אמור להיכתב"), "LOG_LEVEL=warn ← info לא נכתב");
  const w = out.find((l) => l.msg === "נכתב");
  assert.ok(w, "warn נכתב");
  assert.equal(w.level, "warn");
  assert.deepEqual(w.user, { email: "dana@example.com", password: "[REDACTED]", refreshToken: "[REDACTED]" }, "שדות סודיים ← [REDACTED], גם בתוך אובייקטים");
  assert.equal(w.headers.Authorization, "[REDACTED]");
});

test("Idempotency-Key ב־POST /tasks", async (t) => {
  const { signup, clock } = await start(t);
  const dana = await signup("dana@example.com");
  const yossi = await signup("yossi@example.com");
  const key = { "Idempotency-Key": "create-task-0001" };

  const first = await dana("POST", "/tasks", { title: "לקנות חלב" }, key);
  assert.equal(first.status, 201);
  assert.equal(first.headers.get("idempotent-replayed"), null, "בקשה ראשונה — בלי Idempotent-Replayed");
  const again = await dana("POST", "/tasks", { title: "לקנות חלב" }, key);
  assert.equal(again.status, 201, "בקשה חוזרת ← אותו status");
  assert.deepEqual(again.body, first.body, "…ואותו body (אותו id)");
  assert.equal(again.headers.get("idempotent-replayed"), "true");
  assert.equal((await dana("GET", "/tasks")).body.meta.total, 1, "נוצרה משימה אחת בלבד");

  const reused = await dana("POST", "/tasks", { title: "משהו אחר" }, key);
  assert.equal(reused.status, 422, "אותו מפתח עם body אחר ← 422");
  assert.equal(reused.body.error.code, "IDEMPOTENCY_KEY_REUSED");

  const other = await yossi("POST", "/tasks", { title: "לקנות חלב" }, key);
  assert.equal(other.status, 201);
  assert.notEqual(other.body.id, first.body.id, "המפתח הוא לכל משתמש — ליוסי נוצרה משימה משלו");
  assert.equal(other.headers.get("idempotent-replayed"), null);

  for (const bad of ["short", "has space-12345", "x".repeat(101)]) {
    const res = await dana("POST", "/tasks", { title: "x" }, { "Idempotency-Key": bad });
    assert.equal(res.status, 400, `מפתח לא תקין (${bad.slice(0, 15)}) ← 400`);
  }

  const k2 = { "Idempotency-Key": "create-task-0002" };
  assert.equal((await dana("POST", "/tasks", { title: "x", dueDate: "2026-01-01" }, k2)).status, 422, "תאריך בעבר ← 422");
  assert.equal((await dana("POST", "/tasks", { title: "x", dueDate: "2026-12-01" }, k2)).status, 201, "בקשה שנכשלה לא \"תופסת\" את המפתח — אפשר לתקן ולשלוח שוב");

  assert.equal((await dana("POST", "/tasks", { title: "בלי מפתח" })).status, 201, "בלי Idempotency-Key — עובד כרגיל");
});

test("Idempotency-Key: תוקף של 24 שעות", async (t) => {
  const { signup, clock } = await start(t, { accessTokenTtlSeconds: 3 * 86400 });
  const dana = await signup("dana@example.com");
  const key = { "Idempotency-Key": "create-task-0003" };
  const first = await dana("POST", "/tasks", { title: "x" }, key);
  clock.now = new Date("2026-11-05T09:59:00.000Z");
  assert.equal((await dana("POST", "/tasks", { title: "x" }, key)).body.id, first.body.id, "אחרי 23:59 שעות — עדיין replay");
  clock.now = new Date("2026-11-05T10:00:00.000Z");
  const later = await dana("POST", "/tasks", { title: "x" }, key);
  assert.equal(later.status, 201);
  assert.notEqual(later.body.id, first.body.id, "אחרי 24 שעות (IDEMPOTENCY_TTL_HOURS) המפתח פג — נוצרת משימה חדשה");
});

test("הגבלת קצב על /auth/login ו־/auth/register", async (t) => {
  const { call, clock } = await start(t);
  const ok = await call("POST", "/auth/register", { email: "dana@example.com", password: "long-password-1" });
  assert.equal(ok.status, 201);
  assert.equal(ok.headers.get("ratelimit-limit"), "10", "RateLimit-Limit גם בתשובה מוצלחת");
  assert.equal(ok.headers.get("ratelimit-remaining"), "9");
  for (let i = 0; i < 9; i++) {
    clock.now = new Date(Date.parse("2026-11-04T10:00:00.000Z") + (i + 1) * 1000);
    assert.equal((await call("POST", "/auth/login", { email: "dana@example.com", password: "wrong-password" })).status, 401);
  }
  clock.now = new Date("2026-11-04T10:00:20.000Z");
  const blocked = await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" });
  assert.equal(blocked.status, 429, "הבקשה ה־11 בתוך דקה (register + login יחד) ← 429 — גם עם סיסמה נכונה");
  assert.equal(blocked.body.error.code, "TOO_MANY_REQUESTS");
  assert.equal(blocked.headers.get("retry-after"), "40", "Retry-After בשניות: הבקשה הראשונה (10:00:00) יוצאת מהחלון ב־10:01:00");
  assert.equal(blocked.headers.get("ratelimit-remaining"), "0");
  assert.equal((await call("GET", "/health")).status, 200, "רק auth מוגבל — /health לא");

  clock.now = new Date("2026-11-04T10:00:59.000Z");
  assert.equal((await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" })).status, 429, "בקשה שנדחתה לא \"מאריכה\" — אבל עדיין לא עברה דקה");
  clock.now = new Date("2026-11-04T10:01:00.000Z");
  assert.equal((await call("POST", "/auth/login", { email: "dana@example.com", password: "long-password-1" })).status, 200, "חלון נע: אחרי שהבקשה הראשונה יצאה מהחלון — שוב מותר");
});

test("הגבלת קצב: לפי CONFIG", async (t) => {
  const { call } = await start(t, { authRateLimitPerMinute: 2 });
  const login = () => call("POST", "/auth/login", { email: "x@example.com", password: "whatever-pass" });
  assert.equal((await login()).status, 401);
  assert.equal((await login()).status, 401);
  assert.equal((await login()).status, 429, "AUTH_RATE_LIMIT_PER_MINUTE=2 ← השלישית נחסמת");
});

test("אזור הזמן של המשתמש", async (t) => {
  const { call, signup, clock } = await start(t, { accessTokenTtlSeconds: 3 * 86400 });
  const plain = await call("POST", "/auth/register", { email: "utc@example.com", password: "long-password-1" });
  assert.equal(plain.body.timeZone, "UTC", "ברירת מחדל: UTC");
  for (const tz of ["Mars/Olympus", "Israel Time", ""]) {
    const res = await call("POST", "/auth/register", { email: "bad@example.com", password: "long-password-1", timeZone: tz });
    assert.equal(res.status, 400, `timeZone "${tz}" ← 400`);
  }
  const dana = await signup("dana@example.com", { timeZone: "Asia/Jerusalem" });
  const utc = await signup("u2@example.com");
  assert.equal((await dana("GET", "/auth/me")).body.timeZone, "Asia/Jerusalem");

  clock.now = new Date("2026-11-04T22:30:00.000Z"); // בישראל: 5 בנובמבר, 00:30
  const late = await dana("POST", "/tasks", { title: "x", dueDate: "2026-11-04" });
  assert.equal(late.status, 422, "בישראל כבר 5 בנובמבר — 4 בנובמבר זה עבר");
  assert.equal(late.body.error.code, "DUE_DATE_IN_PAST");
  assert.equal((await utc("POST", "/tasks", { title: "x", dueDate: "2026-11-04" })).status, 201, "ב־UTC עדיין 4 בנובמבר");
  assert.equal((await dana("POST", "/tasks", { title: "y", dueDate: "2026-11-05" })).status, 201);
  clock.now = new Date("2026-11-05T22:30:00.000Z");
  assert.equal((await dana("GET", "/tasks/stats")).body.overdue, 1, "overdue לפי \"היום\" של המשתמש (6 בנובמבר בישראל)");
  assert.equal((await utc("GET", "/tasks/stats")).body.overdue, 1);

  const patched = await dana("PATCH", "/auth/me", { timeZone: "America/New_York" });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.timeZone, "America/New_York");
  assert.equal((await dana("GET", "/tasks/stats")).body.overdue, 0, "בניו יורק עדיין 5 בנובמבר");
  assert.equal((await dana("PATCH", "/auth/me", { timeZone: "Nowhere/City" })).status, 400);
  assert.equal((await dana("PATCH", "/auth/me", { role: "admin" })).status, 400, "PATCH /auth/me — רק timeZone (strict)");
});
