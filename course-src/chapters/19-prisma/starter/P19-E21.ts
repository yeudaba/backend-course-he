// P19-E21: נמכרו יותר יחידות ממה שהיה
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function buy(prisma: PrismaClient, productId: number, qty: number) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("PRODUCT_NOT_FOUND");
  if (product.stock < qty) throw new AppError("OUT_OF_STOCK");
  const updated = await prisma.product.update({ where: { id: productId }, data: { stock: product.stock - qty } });
  return updated.stock;
}
