// P19-E13
// revenueByCategory(prisma, { since }) → [{ category, revenue }] — עם $queryRaw
import type { PrismaClient } from "../files/generated/prisma/client.ts";


export async function revenueByCategory(prisma: PrismaClient, { since }: { since: Date }) {
  // כתוב כאן
}
