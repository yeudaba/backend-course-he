import type { INestApplication } from "@nestjs/common";
import { createTestApp } from "./helpers";

// שלב ח׳: מה שהפלטפורמה ובדיקת העשן שואלות
describe("health · ready · version (e2e)", () => {
  let app: INestApplication;
  let http: Awaited<ReturnType<typeof createTestApp>>["http"];

  beforeEach(async () => {
    ({ app, http } = await createTestApp());
  });
  afterEach(() => app.close());

  it("/health — בלי התחברות ובלי מסד", async () => {
    await http().get("/health").expect(200, { ok: true });
  });

  it("/ready — 503 כשאין מסד (בבדיקה הזו אין PrismaService אמיתי)", async () => {
    const res = await http().get("/ready").expect(503);
    expect(res.body.error.code).toBe("NOT_READY");
  });

  it("/version — מה רץ עכשיו", async () => {
    await http().get("/version").expect(200, { name: "tasks-api", version: "1.0.0", commit: "test-commit", startedAt: "2026-11-04T10:00:00.000Z" });
  });
});
