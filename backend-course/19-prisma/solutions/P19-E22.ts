// P19-E22: מתוקן — מתרגמים רק את מה שמבינים
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function updateEmail(prisma: PrismaClient, customerId: number, email: string) {
  try {
    return await prisma.customer.update({ where: { id: customerId }, data: { email } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") throw new AppError("CUSTOMER_NOT_FOUND");
      if (err.code === "P2002") throw new AppError("EMAIL_TAKEN");
    }
    throw err;
  }
}
