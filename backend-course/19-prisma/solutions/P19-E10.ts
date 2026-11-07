// P19-E10
import type { Prisma, PrismaClient } from "../files/generated/prisma/client.ts";

export async function searchProducts(
  prisma: PrismaClient,
  { q, minPrice, maxPrice, page = 1, limit = 10 }: { q?: string; minPrice?: number; maxPrice?: number; page?: number; limit?: number } = {}
) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    price: { gte: minPrice, lte: maxPrice },
  };
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: { id: true, name: true, price: true },
      orderBy: [{ price: "asc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { data: rows.map((p) => ({ ...p, price: Number(p.price) })), total };
}
