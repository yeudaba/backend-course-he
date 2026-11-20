// P19-E20: מתוקן — include במקום שאילתה לכל הזמנה
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function ordersWithCustomers(prisma: PrismaClient) {
  const orders = await prisma.order.findMany({
    orderBy: { id: "asc" },
    select: { id: true, status: true, customerId: true },
  });
  const out = [];
  for (const o of orders) {
    const c = await prisma.customer.findUnique({ where: { id: o.customerId } });
    out.push({ id: o.id, status: o.status, customer: c!.fullName });
  }
  return out;
}
