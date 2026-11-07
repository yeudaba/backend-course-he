import type { INestApplication } from "@nestjs/common";
import { createTestApp, signUp, type TestClock } from "./helpers";

// שלב ז׳: request ID, לוגים, Idempotency-Key, הגבלת קצב ואזורי זמן
describe("מוכן לפרודקשן (e2e)", () => {
  let app: INestApplication;
  let clock: TestClock;
  let logs: Record<string, unknown>[];
  let http: Awaited<ReturnType<typeof createTestApp>>["http"];

  beforeEach(async () => {
    ({ app, clock, logs, http } = await createTestApp());
  });
  afterEach(() => app.close());

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  it("X-Request-Id: חדש לכל בקשה, ושל הלקוח אם הוא תקין", async () => {
    const a = await http().get("/health").expect(200);
    expect(a.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
    await http().get("/health").set("X-Request-Id", "client-abc_123").expect("X-Request-Id", "client-abc_123");
    const bad = await http().get("/health").set("X-Request-Id", "bad id with spaces");
    expect(bad.headers["x-request-id"]).not.toBe("bad id with spaces");
  });

  it("שורת לוג JSON לכל בקשה — עם אותו requestId ועם userId, ובלי סיסמאות", async () => {
    const { accessToken } = await signUp(app, "dana@example.com");
    const res = await http().get("/tasks").set(auth(accessToken)).set("X-Request-Id", "trace-me-1").expect(200);
    const line = logs.find((l) => l.requestId === res.headers["x-request-id"]);
    expect(line).toMatchObject({ level: "info", msg: "request", method: "GET", path: "/tasks", status: 200, userId: 1 });
    expect(typeof line?.durationMs).toBe("number");
    await http().get("/nothing").expect(404);
    expect(logs.at(-1)).toMatchObject({ level: "warn", status: 404 });
    expect(JSON.stringify(logs)).not.toContain("long-password-1");
  });

  it("Idempotency-Key: אותה בקשה פעמיים ← משימה אחת", async () => {
    const { accessToken } = await signUp(app, "dana@example.com");
    const send = (body: object, key = "create-task-0001") => http().post("/tasks").set(auth(accessToken)).set("Idempotency-Key", key).send(body);
    const first = await send({ title: "לקנות חלב" }).expect(201);
    const second = await send({ title: "לקנות חלב" }).expect(201);
    expect(second.body).toEqual(first.body);
    expect(second.headers["idempotent-replayed"]).toBe("true");
    expect((await http().get("/tasks").set(auth(accessToken))).body.meta.total).toBe(1);
    await send({ title: "משהו אחר" }).expect(422).expect((r) => expect(r.body.error.code).toBe("IDEMPOTENCY_KEY_REUSED"));
    await send({ title: "x" }, "short").expect(400);
  });

  it("הגבלת קצב על כניסה: 429 עם Retry-After, ואחרי דקה — שוב מותר", async () => {
    await http().post("/auth/register").send({ email: "dana@example.com", password: "long-password-1" }).expect(201);
    for (let i = 0; i < 9; i++) await http().post("/auth/login").send({ email: "dana@example.com", password: "wrong" }).expect(401);
    const blocked = await http().post("/auth/login").send({ email: "dana@example.com", password: "long-password-1" }).expect(429);
    expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
    expect(blocked.headers["ratelimit-remaining"]).toBe("0");
    clock.set("2026-11-04T10:01:00.000Z");
    await http().post("/auth/login").send({ email: "dana@example.com", password: "long-password-1" }).expect(200);
  });

  it("אזור זמן: \"היום\" של המשתמש", async () => {
    const reg = await http().post("/auth/register").send({ email: "dana@example.com", password: "long-password-1", timeZone: "Asia/Jerusalem" }).expect(201);
    expect(reg.body.timeZone).toBe("Asia/Jerusalem");
    await http().post("/auth/register").send({ email: "x@example.com", password: "long-password-1", timeZone: "Mars/Olympus" }).expect(400);
    clock.set("2026-11-04T22:30:00.000Z"); // 00:30 ב־5 בנובמבר בישראל
    const token = (await http().post("/auth/login").send({ email: "dana@example.com", password: "long-password-1" })).body.accessToken;
    await http().post("/tasks").set(auth(token)).send({ title: "x", dueDate: "2026-11-04" }).expect(422);
    await http().patch("/auth/me").set(auth(token)).send({ timeZone: "UTC" }).expect(200);
    await http().post("/tasks").set(auth(token)).send({ title: "x", dueDate: "2026-11-04" }).expect(201);
  });
});
