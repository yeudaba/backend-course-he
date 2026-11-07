// P19-E14
// placeOrder(prisma, customerId, items) → { orderId, total } | OUT_OF_STOCK — ב־$transaction
import type { PrismaClient } from "../files/generated/prisma/client.ts";
export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function placeOrder(prisma: PrismaClient, customerId: number, items: { productId: number; quantity: number }[]) {
  // כתוב כאן
}
