// P19-E09
// adjustStock(prisma, productId, delta) → המלאי החדש | PRODUCT_NOT_FOUND
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";
export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function adjustStock(prisma: PrismaClient, productId: number, delta: number) {
  // כתוב כאן
}
