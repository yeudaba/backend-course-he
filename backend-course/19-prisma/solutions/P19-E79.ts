// P19-E79: orderStats עם groupBy
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function orderStats(prisma: PrismaClient, customerId?: number) {
  const rows = await prisma.order.groupBy({
    by: ["status"],
    where: customerId === undefined ? {} : { customerId },
    _count: { _all: true },
  });
  const byStatus = { pending: 0, paid: 0, shipped: 0, cancelled: 0 };
  for (const r of rows) byStatus[r.status] = r._count._all;
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  return { total, byStatus };
}
