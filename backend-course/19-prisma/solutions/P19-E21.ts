// P19-E21: מתוקן — עדכון אטומי עם תנאי
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function buy(prisma: PrismaClient, productId: number, qty: number) {
  const { count } = await prisma.product.updateMany({
    where: { id: productId, stock: { gte: qty } },
    data: { stock: { decrement: qty } },
  });
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true } });
  if (!product) throw new AppError("PRODUCT_NOT_FOUND");
  if (count === 0) throw new AppError("OUT_OF_STOCK");
  return product.stock;
}
