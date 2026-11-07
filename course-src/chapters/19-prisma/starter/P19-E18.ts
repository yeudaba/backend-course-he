// P19-E18
// setProductTags(prisma, productId, names) → שמות ממוינים | PRODUCT_NOT_FOUND
import type { PrismaClient } from "../files/generated/prisma/client.ts";
export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function setProductTags(prisma: PrismaClient, productId: number, names: string[]) {
  // כתוב כאן
}
