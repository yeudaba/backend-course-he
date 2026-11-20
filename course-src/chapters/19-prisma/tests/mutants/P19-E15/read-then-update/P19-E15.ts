// P19-E15
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function cancelOrder(prisma: PrismaClient, orderId: number) {
  return prisma.$transaction(async (tx) => {
    // המעבר לסטטוס cancelled — אטומי: רק אחד מכמה ביטולים במקביל "ינצח"
    const o = await tx.order.findUnique({ where: { id: orderId } });
    const ok = o && (o.status === "pending" || o.status === "paid");
    if (ok) await new Promise((r) => setTimeout(r, 20));
    if (ok) await tx.order.update({ where: { id: orderId }, data: { status: "cancelled" } });
    const count = ok ? 1 : 0;
    if (count === 0) {
      const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
      if (!order) throw new AppError("ORDER_NOT_FOUND");
      throw new AppError(order.status === "cancelled" ? "ALREADY_CANCELLED" : "CANNOT_CANCEL");
    }
    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const i of items) {
      await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
    }
    return items.reduce((sum, i) => sum + i.quantity, 0);
  });
}
