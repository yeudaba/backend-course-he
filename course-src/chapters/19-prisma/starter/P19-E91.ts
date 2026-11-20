// P19-E91: עמוד של הזמנות — העמוד הראשון לא מוצג, הסדר הפוך, ו־total שגוי כשמסננים.
// items: { id, customerId, status } מהחדשה (createdAt desc, id desc) · status מסנן · page מ־1 (ברירת מחדל 1), pageSize 5
// total: אחרי הסינון
//
// בדיקה:  npm run check P19-E91
import type { PrismaClient } from "../files/generated/prisma/client.ts";

type Status = "pending" | "paid" | "shipped" | "cancelled";

export async function listOrders(prisma: PrismaClient, { status, page = 1, pageSize = 5 }: { status?: Status; page?: number; pageSize?: number } = {}) {
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: { id: true, customerId: true, status: true },
      orderBy: { createdAt: "asc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.order.count(),
  ]);
  return { items, total };
}
