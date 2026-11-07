// P19-E11
// customerOrders(prisma, customerId) → null | { fullName, orders: [{ id, status, items: [{ product, quantity, unitPrice }] }] }
import type { PrismaClient } from "../files/generated/prisma/client.ts";


export async function customerOrders(prisma: PrismaClient, customerId: number) {
  // כתוב כאן
}
