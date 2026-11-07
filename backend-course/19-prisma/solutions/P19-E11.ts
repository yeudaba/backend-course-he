// P19-E11
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function customerOrders(prisma: PrismaClient, customerId: number) {
  const c = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      fullName: true,
      orders: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          status: true,
          items: {
            orderBy: { product: { name: "asc" } },
            select: { quantity: true, unitPrice: true, product: { select: { name: true } } },
          },
        },
      },
    },
  });
  if (!c) return null;
  return {
    fullName: c.fullName,
    orders: c.orders.map((o) => ({
      id: o.id,
      status: o.status,
      items: o.items.map((i) => ({ product: i.product.name, quantity: i.quantity, unitPrice: Number(i.unitPrice) })),
    })),
  };
}
