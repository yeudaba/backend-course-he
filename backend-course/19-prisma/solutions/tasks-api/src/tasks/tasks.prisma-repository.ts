import { Prisma, type PrismaClient, type Task as TaskRow } from "../generated/prisma/client.ts";
import type { TaskPage, TaskStats, TasksRepository } from "./tasks.repository.ts";
import type { ListQuery, Task } from "./tasks.schema.ts";

// במסד: Date. ב־API: "YYYY-MM-DD" ו־ISO — ההמרה במקום אחד
function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toData(data: Partial<Omit<Task, "id">>) {
  const { dueDate, createdAt, updatedAt, ...rest } = data;
  return {
    ...rest,
    ...(dueDate !== undefined ? { dueDate: dueDate === null ? null : new Date(`${dueDate}T00:00:00Z`) } : {}),
    ...(createdAt !== undefined ? { createdAt: new Date(createdAt) } : {}),
    ...(updatedAt !== undefined ? { updatedAt: new Date(updatedAt) } : {}),
  };
}

const isNotFound = (err: unknown) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";

export class PrismaTasksRepository implements TasksRepository {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async list({ status, priority, q, sort, page, limit }: ListQuery): Promise<TaskPage> {
    const where: Prisma.TaskWhereInput = {
      status,
      priority,
      ...(q
        ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }
        : {}),
    };
    const direction = sort.startsWith("-") ? "desc" : "asc";
    const field = sort.replace("-", "") as "createdAt" | "dueDate" | "priority";
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [
      field === "dueDate" ? { dueDate: { sort: direction, nulls: "last" } } : { [field]: direction },
      { id: "asc" }, // שובר שוויון — סדר יציב בין עמודים
    ];
    const [rows, total] = await Promise.all([
      this.prisma.task.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.task.count({ where }),
    ]);
    return { data: rows.map(toTask), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async stats(today: string): Promise<TaskStats> {
    const [groups, overdue] = await Promise.all([
      this.prisma.task.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.task.count({ where: { status: { not: "done" }, dueDate: { lt: new Date(`${today}T00:00:00Z`) } } }),
    ]);
    const byStatus: TaskStats["byStatus"] = { todo: 0, in_progress: 0, done: 0 };
    for (const g of groups) byStatus[g.status] = g._count._all;
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    return { total, byStatus, overdue };
  }

  async findById(id: number) {
    const row = await this.prisma.task.findUnique({ where: { id } });
    return row ? toTask(row) : undefined;
  }

  async insert(data: Omit<Task, "id">) {
    return toTask(await this.prisma.task.create({ data: toData(data) as Prisma.TaskCreateInput }));
  }

  async update(id: number, changes: Partial<Omit<Task, "id">>) {
    try {
      return toTask(await this.prisma.task.update({ where: { id }, data: toData(changes) }));
    } catch (err) {
      if (isNotFound(err)) return undefined;
      throw err;
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.task.delete({ where: { id } });
      return true;
    } catch (err) {
      if (isNotFound(err)) return false;
      throw err;
    }
  }
}
