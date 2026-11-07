// P19-E14
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function placeOrder(prisma: PrismaClient, customerId: number, items: { productId: number; quantity: number }[]) {
  return prisma.$transaction(async (tx) => {
    const lines = [];
    for (const { productId, quantity } of items) {
      const { count } = await tx.product.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (count === 0) throw new AppError("OUT_OF_STOCK");
      const { price } = await tx.product.findUniqueOrThrow({ where: { id: productId }, select: { price: true } });
      lines.push({ productId, quantity, unitPrice: price });
    }
    const order = await tx.order.create({ data: { customerId, status: "pending", items: { create: lines } } });
    const total = lines.reduce((sum, l) => sum + Number(l.unitPrice) * l.quantity, 0);
    return { orderId: order.id, total: Math.round(total * 100) / 100 };
  });
}
