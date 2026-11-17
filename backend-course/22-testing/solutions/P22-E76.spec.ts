// P22-E76 — בדיקות unit ב־Jest
import { HttpError, InMemoryTasksRepository, TasksService } from "./P22-E76";

describe("TasksService", () => {
  let service: TasksService;
  beforeEach(() => {
    const clock = { now: () => new Date("2026-11-04T22:30:00Z") };
    service = new TasksService(new InMemoryTasksRepository(), clock);
  });

  it("יוצר משימה, עם trim", async () => {
    await expect(service.create(1, { title: "  חלב " })).resolves.toMatchObject({ id: 1, ownerId: 1, title: "חלב", done: false, dueDate: null });
  });

  it("title ריק ← 400", async () => {
    await expect(service.create(1, { title: "   " })).rejects.toMatchObject({ status: 400, code: "TITLE_REQUIRED" });
  });

  it("dueDate: היום מותר, אתמול — 422", async () => {
    await expect(service.create(1, { title: "x", dueDate: "2026-11-04" })).resolves.toMatchObject({ dueDate: "2026-11-04" });
    await expect(service.create(1, { title: "x", dueDate: "2026-11-03" })).rejects.toMatchObject({ status: 422, code: "DUE_DATE_IN_PAST" });
    await expect(service.create(1, { title: "x", dueDate: "2026-11-05" })).resolves.toMatchObject({ dueDate: "2026-11-05" });
  });

  it("השגיאה היא HttpError", async () => {
    await expect(service.create(1, { title: "" })).rejects.toBeInstanceOf(HttpError);
  });

  it("complete — רק של הבעלים", async () => {
    const t = await service.create(1, { title: "חלב" });
    await expect(service.complete(2, t.id)).rejects.toMatchObject({ status: 404, code: "TASK_NOT_FOUND" });
    await expect(service.complete(1, 99)).rejects.toMatchObject({ status: 404 });
    await expect(service.complete(1, t.id)).resolves.toMatchObject({ id: t.id, done: true });
  });
});
