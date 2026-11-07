import { createTestDatabase } from "./db";
import { PrismaIdempotencyRepository } from "../src/idempotency/idempotency.prisma-repository";
import { PrismaUsersRepository } from "../src/users/users.prisma-repository";
import type { PrismaService } from "../src/prisma/prisma.service";

// integration: רק UNIQUE אמיתי במסד מבטיח "זוכה אחד" כששתי בקשות מגיעות יחד
describe("PrismaIdempotencyRepository (integration)", () => {
  let db: Awaited<ReturnType<typeof createTestDatabase>>;
  let repo: PrismaIdempotencyRepository;
  let dana: number;
  const now = new Date("2026-11-04T10:00:00.000Z");

  beforeAll(async () => {
    db = await createTestDatabase();
    repo = new PrismaIdempotencyRepository(db.prisma as unknown as PrismaService);
  });
  afterAll(() => db.close());
  beforeEach(async () => {
    await db.reset();
    const users = new PrismaUsersRepository(db.prisma as unknown as PrismaService);
    dana = (await users.insert({ email: "dana@example.com", passwordHash: "x", role: "user", timeZone: "UTC", createdAt: "2026-11-01T00:00:00.000Z" }))!.id;
  });

  it("10 בקשות במקביל עם אותו מפתח — רק אחת מקבלת new", async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () => repo.reserve(dana, "key-00000001", "fp", now, 24)));
    expect(results.filter((r) => r.kind === "new")).toHaveLength(1);
    expect(results.filter((r) => r.kind === "in_progress")).toHaveLength(9);
  });

  it("complete ← replay; טביעה אחרת ← mismatch; אחרי TTL ← new", async () => {
    await repo.reserve(dana, "key-00000001", "fp", now, 24);
    await repo.complete(dana, "key-00000001", 201, { id: 7 });
    await expect(repo.reserve(dana, "key-00000001", "fp", now, 24)).resolves.toEqual({ kind: "replay", status: 201, body: { id: 7 } });
    await expect(repo.reserve(dana, "key-00000001", "other", now, 24)).resolves.toEqual({ kind: "mismatch" });
    const later = new Date(now.getTime() + 24 * 3_600_000);
    await expect(repo.reserve(dana, "key-00000001", "other", later, 24)).resolves.toEqual({ kind: "new" });
  });

  it("release מוחק רק מפתח שלא הושלם", async () => {
    await repo.reserve(dana, "key-00000002", "fp", now, 24);
    await repo.release(dana, "key-00000002");
    await expect(repo.reserve(dana, "key-00000002", "fp", now, 24)).resolves.toEqual({ kind: "new" });
  });
});
