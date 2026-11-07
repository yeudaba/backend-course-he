import type { INestApplication } from "@nestjs/common";
import { createTestApp, signUp, type TestClock } from "./helpers";
import type { InMemoryUsersRepository } from "../src/users/users.repository";
import bcrypt from "bcryptjs";

// e2e: כל השרשרת — HTTP, guards, pipes, controller, service, filter — עם repositories בזיכרון
describe("tasks-api (e2e)", () => {
  let app: INestApplication;
  let clock: TestClock;
  let users: InMemoryUsersRepository;
  let http: Awaited<ReturnType<typeof createTestApp>>["http"];

  beforeEach(async () => {
    ({ app, clock, users, http } = await createTestApp());
  });

  afterEach(async () => {
    await app.close();
  });

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  it("GET /health — פתוח", async () => {
    await http().get("/health").expect(200, { ok: true });
  });

  describe("התחברות", () => {
    it("הרשמה, כניסה ו־/auth/me", async () => {
      const res = await http().post("/auth/register").send({ email: "Dana@Example.com", password: "long-password-1" }).expect(201);
      expect(res.body).toEqual({ id: 1, email: "dana@example.com", role: "user", createdAt: "2026-11-04T10:00:00.000Z" });
      const { accessToken } = await signUp(app, "yossi@example.com");
      await http().get("/auth/me").set(auth(accessToken)).expect(200).expect((r) => expect(r.body.email).toBe("yossi@example.com"));
    });

    it("role בהרשמה — 400 במבנה השגיאות שלנו", async () => {
      const res = await http().post("/auth/register").send({ email: "evil@example.com", password: "long-password-1", role: "admin" }).expect(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("בלי טוקן — 401; טוקן שפג — 401 INVALID_TOKEN", async () => {
      await http().get("/tasks").expect(401).expect((r) => expect(r.body.error.code).toBe("UNAUTHORIZED"));
      const { accessToken } = await signUp(app, "dana@example.com");
      clock.set("2026-11-04T10:15:00.000Z");
      await http().get("/tasks").set(auth(accessToken)).expect(401).expect((r) => expect(r.body.error.code).toBe("INVALID_TOKEN"));
    });

    it("refresh מחזיר זוג חדש, והישן לא עובד שוב", async () => {
      const { refreshToken } = await signUp(app, "dana@example.com");
      const res = await http().post("/auth/refresh").send({ refreshToken }).expect(200);
      await http().get("/tasks").set(auth(res.body.accessToken)).expect(200);
      await http().post("/auth/refresh").send({ refreshToken }).expect(401);
    });
  });

  describe("בעלות", () => {
    it("משימה של משתמש אחר — 404 בכל פעולה", async () => {
      const dana = (await signUp(app, "dana@example.com")).accessToken;
      const yossi = (await signUp(app, "yossi@example.com")).accessToken;
      const created = await http().post("/tasks").set(auth(dana)).send({ title: "של דנה" }).expect(201);
      expect(created.headers.location).toBe(`/tasks/${created.body.id}`);
      const path = `/tasks/${created.body.id}`;

      await http().get(path).set(auth(yossi)).expect(404);
      await http().patch(path).set(auth(yossi)).send({ title: "נפרץ" }).expect(404);
      await http().delete(path).set(auth(yossi)).expect(404);
      await http().get("/tasks").set(auth(yossi)).expect(200).expect((r) => expect(r.body.meta.total).toBe(0));
      await http().get(path).set(auth(dana)).expect(200).expect((r) => expect(r.body.title).toBe("של דנה"));
    });
  });

  describe("תפקידים", () => {
    it("/users — 403 למשתמש רגיל, 200 ל־admin, בלי hash", async () => {
      const dana = (await signUp(app, "dana@example.com")).accessToken;
      await http().get("/users").set(auth(dana)).expect(403);
      await users.insert({ email: "admin@example.com", passwordHash: await bcrypt.hash("admin-password-1", 4), role: "admin", createdAt: "2026-11-01T00:00:00.000Z" });
      const admin = (await http().post("/auth/login").send({ email: "admin@example.com", password: "admin-password-1" }).expect(200)).body.accessToken;
      const res = await http().get("/users").set(auth(admin)).expect(200);
      expect(res.body).toHaveLength(2);
      for (const u of res.body) expect(u).not.toHaveProperty("passwordHash");
    });
  });

  describe("ולידציה ושגיאות", () => {
    it("שדות לא תקינים — details עם path", async () => {
      const dana = (await signUp(app, "dana@example.com")).accessToken;
      const res = await http().post("/tasks").set(auth(dana)).send({ title: "", priority: "urgent" }).expect(400);
      expect(res.body.error.details.map((d: { path: string }) => d.path).sort()).toEqual(["body.priority", "body.title"]);
    });

    it("JSON שבור — INVALID_JSON", async () => {
      const dana = (await signUp(app, "dana@example.com")).accessToken;
      await http().post("/tasks").set(auth(dana)).set("Content-Type", "application/json").send("{oops").expect(400)
        .expect((r) => expect(r.body.error.code).toBe("INVALID_JSON"));
    });
  });
});
