// P19-E10
// searchProducts(prisma, { q, minPrice, maxPrice, page, limit }) → { data: [{ id, name, price }], total }
import type { Prisma, PrismaClient } from "../files/generated/prisma/client.ts";


export async function searchProducts(
  prisma: PrismaClient,
  { q, minPrice, maxPrice, page = 1, limit = 10 }: { q?: string; minPrice?: number; maxPrice?: number; page?: number; limit?: number } = {}
) {
  // כתוב כאן
}
