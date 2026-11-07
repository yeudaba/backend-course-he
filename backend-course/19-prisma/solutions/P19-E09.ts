// P19-E09
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function adjustStock(prisma: PrismaClient, productId: number, delta: number) {
  try {
    const p = await prisma.product.update({ where: { id: productId }, data: { stock: { increment: delta } }, select: { stock: true } });
    return p.stock;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") throw new AppError("PRODUCT_NOT_FOUND");
    throw err;
  }
}
