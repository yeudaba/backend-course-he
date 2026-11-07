import { createTestDatabase } from "./db";
import { PrismaTasksRepository } from "../src/tasks/tasks.prisma-repository";
import { PrismaUsersRepository } from "../src/users/users.prisma-repository";
import type { PrismaService } from "../src/prisma/prisma.service";
import type { Task } from "../src/tasks/tasks.schema";

// integration: ה־repositories של Prisma מול PostgreSQL אמיתי — מה שבדיקות בזיכרון לא יכולות לתפוס (SQL, אינדקסים, NULLs, אזורי זמן)
describe("Prisma repositories (integration)", () => {
  let db: Awaited<ReturnType<typeof createTestDatabase>>;
  let tasks: PrismaTasksRepository;
  let users: PrismaUsersRepository;
  let dana: number;
  let yossi: number;

  beforeAll(async () => {
    db = await createTestDatabase();
    const prisma = db.prisma as unknown as PrismaService;
    tasks = new PrismaTasksRepository(prisma);
    users = new PrismaUsersRepository(prisma);
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.reset();
    const make = (email: string) => users.insert({ email, passwordHash: "x", role: "user", timeZone: "UTC", createdAt: "2026-11-01T00:00:00.000Z" });
    dana = (await make("dana@example.com"))!.id;
    yossi = (await make("yossi@example.com"))!.id;
  });

  const task = (overrides: Partial<Omit<Task, "id">> = {}): Omit<Task, "id"> => ({
    title: "משימה",
    description: null,
    status: "todo",
    priority: "medium",
    dueDate: null,
    createdAt: "2026-11-04T10:00:00.000Z",
    updatedAt: "2026-11-04T10:00:00.000Z",
    ...overrides,
  });

  it("insert ו־findById — תאריכים חוזרים בדיוק (UTC)", async () => {
    const created = await tasks.insert(dana, task({ dueDate: "2026-12-31" }));
    expect(await tasks.findById(dana, created.id)).toEqual(created);
    expect(created).toMatchObject({ dueDate: "2026-12-31", createdAt: "2026-11-04T10:00:00.000Z" });
  });

  it("findById, update ו־delete לא עובדים על משימה של אחר", async () => {
    const created = await tasks.insert(dana, task());
    expect(await tasks.findById(yossi, created.id)).toBeUndefined();
    expect(await tasks.update(yossi, created.id, { title: "נפרץ" })).toBeUndefined();
    expect(await tasks.delete(yossi, created.id)).toBe(false);
    expect((await tasks.findById(dana, created.id))?.title).toBe("משימה");
  });

  it("list: סינון, חיפוש בלי תלות באותיות, מיון לפי עדיפות, ורק של הבעלים", async () => {
    await tasks.insert(dana, task({ title: "Learn Jest", priority: "low" }));
    await tasks.insert(dana, task({ title: "learn Prisma", priority: "high" }));
    await tasks.insert(dana, task({ title: "Other", priority: "medium", status: "done" }));
    await tasks.insert(yossi, task({ title: "learn too", priority: "high" }));
    const page = await tasks.list(dana, { q: "LEARN", sort: "-priority", page: 1, limit: 20 });
    expect(page.data.map((t) => t.title)).toEqual(["learn Prisma", "Learn Jest"]);
    expect(page.meta).toEqual({ page: 1, limit: 20, total: 2, totalPages: 1 });
    expect((await tasks.list(dana, { status: "done", sort: "-createdAt", page: 1, limit: 20 })).meta.total).toBe(1);
  });

  it("מיון לפי dueDate — בלי תאריך תמיד בסוף", async () => {
    await tasks.insert(dana, task({ title: "none" }));
    await tasks.insert(dana, task({ title: "late", dueDate: "2026-12-20" }));
    await tasks.insert(dana, task({ title: "soon", dueDate: "2026-11-10" }));
    const asc = await tasks.list(dana, { sort: "dueDate", page: 1, limit: 20 });
    const desc = await tasks.list(dana, { sort: "-dueDate", page: 1, limit: 20 });
    expect(asc.data.map((t) => t.title)).toEqual(["soon", "late", "none"]);
    expect(desc.data.map((t) => t.title)).toEqual(["late", "soon", "none"]);
  });

  it("stats — לפי הבעלים, עם overdue", async () => {
    await tasks.insert(dana, task({ dueDate: "2026-11-01" }));
    await tasks.insert(dana, task({ dueDate: "2026-11-01", status: "done" }));
    await tasks.insert(yossi, task({ dueDate: "2026-11-01" }));
    expect(await tasks.stats(dana, "2026-11-05")).toEqual({ total: 2, byStatus: { todo: 1, in_progress: 0, done: 1 }, overdue: 1 });
  });

  it("users: email ייחודי במסד", async () => {
    expect(await users.insert({ email: "dana@example.com", passwordHash: "y", role: "user", timeZone: "UTC", createdAt: "2026-11-02T00:00:00.000Z" })).toBeUndefined();
  });
});
