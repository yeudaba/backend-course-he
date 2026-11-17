// P19-E80: מחיקת לקוח — לא נמצא, או "יש לו הזמנות"
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function deleteCustomer(prisma: PrismaClient, id: number): Promise<boolean> {
  try {
    await prisma.customer.delete({ where: { id } });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return false;
      if (err.code === "P2003") throw new AppError("HAS_ORDERS");
    }
    throw err;
  }
}
