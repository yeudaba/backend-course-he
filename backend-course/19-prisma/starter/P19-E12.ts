// P19-E12
// deleteCategory(prisma, id) | CATEGORY_NOT_FOUND | CATEGORY_NOT_EMPTY
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";
export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function deleteCategory(prisma: PrismaClient, id: number) {
  // כתוב כאן
}
