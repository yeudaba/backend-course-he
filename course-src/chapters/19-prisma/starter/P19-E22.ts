// P19-E22: כל שגיאה הופכת ל"לא נמצא"
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
  } catch {
    throw new AppError("CUSTOMER_NOT_FOUND");
  }
}
