// P19-E12
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

const prismaCode = (err: unknown) => (err instanceof Prisma.PrismaClientKnownRequestError ? err.code : undefined);

export async function deleteCategory(prisma: PrismaClient, id: number) {
  try {
    await prisma.category.delete({ where: { id } });
  } catch (err) {
    if (prismaCode(err) === "P2025") throw new AppError("CATEGORY_NOT_FOUND");
    if (prismaCode(err) === "P2003") throw new AppError("CATEGORY_NOT_EMPTY");
    throw err;
  }
}
