// P19-E17
// listOrders(prisma, { after, limit }) → { data: [{ id, status }], nextCursor }
import type { PrismaClient } from "../files/generated/prisma/client.ts";


export async function listOrders(prisma: PrismaClient, { after, limit = 5 }: { after?: number; limit?: number } = {}) {
  // כתוב כאן
}
