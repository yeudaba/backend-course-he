// P19-E23: כשאין מספיק במקור — היעד כבר קיבל
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function transferStock(prisma: PrismaClient, fromProductId: number, toProductId: number, qty: number) {
  await prisma.$transaction(async (tx) => {
    await prisma.product.update({ where: { id: toProductId }, data: { stock: { increment: qty } } });
    const { count } = await tx.product.updateMany({
      where: { id: fromProductId, stock: { gte: qty } },
      data: { stock: { decrement: qty } },
    });
    if (count === 0) throw new AppError("OUT_OF_STOCK");
  });
}
