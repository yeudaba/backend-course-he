// P19-E91: עמוד של הזמנות — מתוקן
import type { PrismaClient } from "../files/generated/prisma/client.ts";

type Status = "pending" | "paid" | "shipped" | "cancelled";

export async function listOrders(prisma: PrismaClient, { status, page = 1, pageSize = 5 }: { status?: Status; page?: number; pageSize?: number } = {}) {
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: { id: true, customerId: true, status: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count(),
  ]);
  return { items, total };
}
