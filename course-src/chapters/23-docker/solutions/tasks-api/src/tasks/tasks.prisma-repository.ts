import { Injectable } from "@nestjs/common";
import type { Prisma, Task as TaskRow } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { TaskPage, TaskStats, TasksRepository } from "./tasks.repository";
import type { ListQuery, Task } from "./tasks.schema";

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


@Injectable()
export class PrismaTasksRepository implements TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: number, { status, priority, q, sort, page, limit }: ListQuery): Promise<TaskPage> {
    const where: Prisma.TaskWhereInput = {
      ownerId,
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

  async stats(ownerId: number, today: string): Promise<TaskStats> {
    const [groups, overdue] = await Promise.all([
      this.prisma.task.groupBy({ by: ["status"], where: { ownerId }, _count: { _all: true } }),
      this.prisma.task.count({ where: { ownerId, status: { not: "done" }, dueDate: { lt: new Date(`${today}T00:00:00Z`) } } }),
    ]);
    const byStatus: TaskStats["byStatus"] = { todo: 0, in_progress: 0, done: 0 };
    for (const g of groups) byStatus[g.status] = g._count._all;
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    return { total, byStatus, overdue };
  }

  // findFirst ולא findUnique: התנאי הוא id *וגם* ownerId
  async findById(ownerId: number, id: number) {
    const row = await this.prisma.task.findFirst({ where: { id, ownerId } });
    return row ? toTask(row) : undefined;
  }

  async insert(ownerId: number, data: Omit<Task, "id">) {
    return toTask(await this.prisma.task.create({ data: { ...toData(data), ownerId } as Prisma.TaskUncheckedCreateInput }));
  }

  // updateMany/deleteMany עם ownerId ב־WHERE: בדיקה ושינוי באותה שאילתה — אין חלון בין "בדקתי" ל"שיניתי"
  async update(ownerId: number, id: number, changes: Partial<Omit<Task, "id">>) {
    const { count } = await this.prisma.task.updateMany({ where: { id, ownerId }, data: toData(changes) });
    return count === 1 ? this.findById(ownerId, id) : undefined;
  }

  async delete(ownerId: number, id: number) {
    const { count } = await this.prisma.task.deleteMany({ where: { id, ownerId } });
    return count === 1;
  }
}
