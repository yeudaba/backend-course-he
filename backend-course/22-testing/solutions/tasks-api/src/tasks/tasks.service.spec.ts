import { TestClock } from "../../test/clock";
import { HttpError } from "../errors";
import { InMemoryTasksRepository } from "./tasks.repository";
import { TasksService } from "./tasks.service";

// unit: ה־service לבד — repository בזיכרון ושעון קבוע. בלי HTTP, בלי מסד, בלי Nest
describe("TasksService", () => {
  const DANA = 1;
  const YOSSI = 2;
  let clock: TestClock;
  let service: TasksService;

  // לפני כל בדיקה — הכול חדש. אף בדיקה לא תלויה במה שקרה בבדיקה אחרת
  beforeEach(() => {
    clock = new TestClock();
    service = new TasksService(new InMemoryTasksRepository(), clock);
  });

  const input = (overrides: Record<string, unknown> = {}) => ({
    title: "ללמוד בדיקות",
    description: null,
    status: "todo" as const,
    priority: "medium" as const,
    dueDate: null,
    ...overrides,
  });

  it("create — מוסיף id ותאריכים מהשעון", async () => {
    const task = await service.create(DANA, input());
    expect(task).toEqual({
      id: 1,
      title: "ללמוד בדיקות",
      description: null,
      status: "todo",
      priority: "medium",
      dueDate: null,
      createdAt: "2026-11-04T10:00:00.000Z",
      updatedAt: "2026-11-04T10:00:00.000Z",
    });
  });

  it("dueDate: היום מותר, אתמול — 422", async () => {
    await expect(service.create(DANA, input({ dueDate: "2026-11-04" }))).resolves.toMatchObject({ dueDate: "2026-11-04" });
    await expect(service.create(DANA, input({ dueDate: "2026-11-03" }))).rejects.toMatchObject({ status: 422, code: "DUE_DATE_IN_PAST" });
  });

  it("update — מעדכן updatedAt ולא נוגע ב־createdAt", async () => {
    const task = await service.create(DANA, input());
    clock.set("2026-11-05T08:00:00.000Z");
    const updated = await service.update(DANA, task.id, { status: "done" });
    expect(updated).toMatchObject({ status: "done", createdAt: "2026-11-04T10:00:00.000Z", updatedAt: "2026-11-05T08:00:00.000Z" });
  });

  it("משימה של משתמש אחר — כאילו לא קיימת", async () => {
    const task = await service.create(DANA, input());
    const notFound = expect.objectContaining({ status: 404, code: "TASK_NOT_FOUND" });
    await expect(service.get(YOSSI, task.id)).rejects.toEqual(notFound);
    await expect(service.update(YOSSI, task.id, { title: "x" })).rejects.toEqual(notFound);
    await expect(service.remove(YOSSI, task.id)).rejects.toEqual(notFound);
    await expect(service.get(DANA, task.id)).resolves.toMatchObject({ title: "ללמוד בדיקות" });
  });

  it("list ו־stats — רק של המשתמש", async () => {
    await service.create(DANA, input({ title: "א", status: "done" }));
    await service.create(DANA, input({ title: "ב", dueDate: "2026-11-10" }));
    await service.create(YOSSI, input({ title: "ג" }));
    const page = await service.list(DANA, { sort: "-createdAt", page: 1, limit: 20 });
    expect(page.meta.total).toBe(2);
    expect(page.data.map((t) => t.title).sort()).toEqual(["א", "ב"]);
    clock.set("2026-11-11T00:00:00.000Z");
    expect(await service.stats(DANA)).toEqual({ total: 2, byStatus: { todo: 1, in_progress: 0, done: 1 }, overdue: 1 });
  });

  it("שגיאות הן HttpError", async () => {
    await expect(service.get(DANA, 99)).rejects.toBeInstanceOf(HttpError);
  });
});
