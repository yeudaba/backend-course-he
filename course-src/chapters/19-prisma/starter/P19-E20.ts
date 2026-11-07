// P19-E20: שאילתה לכל הזמנה. צריך: לכל היותר 2 שאילתות
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function ordersWithCustomers(prisma: PrismaClient) {
  const orders = await prisma.order.findMany({ orderBy: { id: "asc" } });
  const result = [];
  for (const o of orders) {
    const customer = await prisma.customer.findUnique({ where: { id: o.customerId } });
    result.push({ id: o.id, status: o.status, customer: customer!.fullName });
  }
  return result;
}
