// P19-E17
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function listOrders(prisma: PrismaClient, { after, limit = 5 }: { after?: number; limit?: number } = {}) {
  const rows = await prisma.order.findMany({
    where: { id: { gt: after ?? 0 } },
    orderBy: { id: "asc" },
    take: limit + 1,
    select: { id: true, status: true },
  });
  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit);
  return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
}
