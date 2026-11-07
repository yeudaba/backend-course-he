// P19-E20: מתוקן — include במקום שאילתה לכל הזמנה
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function ordersWithCustomers(prisma: PrismaClient) {
  const orders = await prisma.order.findMany({
    orderBy: { id: "asc" },
    select: { id: true, status: true, customer: { select: { fullName: true } } },
  });
  return orders.map((o) => ({ id: o.id, status: o.status, customer: o.customer.fullName }));
}
