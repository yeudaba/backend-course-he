// P19-E15
// cancelOrder(prisma, orderId) → יחידות שהוחזרו | ORDER_NOT_FOUND | ALREADY_CANCELLED | CANNOT_CANCEL
import type { PrismaClient } from "../files/generated/prisma/client.ts";
export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function cancelOrder(prisma: PrismaClient, orderId: number) {
  // כתוב כאן
}
