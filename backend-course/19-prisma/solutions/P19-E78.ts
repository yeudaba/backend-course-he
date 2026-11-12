// P19-E78: רשימת הזמנות — סינון, מיון, עמודים ו־count
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export type ListQuery = { status?: "pending" | "paid" | "shipped" | "cancelled"; customerId?: number; sort?: "createdAt" | "-createdAt"; page?: number; limit?: number };

export async function listOrders(prisma: PrismaClient, q: ListQuery) {
  const { sort = "-createdAt", page = 1, limit = 5 } = q;
  const where = {
    ...(q.status !== undefined && { status: q.status }),
    ...(q.customerId !== undefined && { customerId: q.customerId }),
  };
  const dir = sort.startsWith("-") ? ("desc" as const) : ("asc" as const);
  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: { id: true, customerId: true, status: true },
      orderBy: [{ createdAt: dir }, { id: dir }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);
  return { data, meta: { page, limit, total } };
}
