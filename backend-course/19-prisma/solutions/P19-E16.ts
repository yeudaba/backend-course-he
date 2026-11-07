// P19-E16
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function catalogStats(prisma: PrismaClient) {
  const [products, active, outOfStock, avg, categories] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stock: 0 } }),
    prisma.product.aggregate({ where: { isActive: true }, _avg: { price: true } }),
    prisma.category.findMany({ select: { name: true, _count: { select: { products: true } } } }),
  ]);
  return {
    products,
    active,
    outOfStock,
    avgActivePrice: Math.round(Number(avg._avg.price ?? 0) * 100) / 100,
    byCategory: Object.fromEntries(categories.map((c) => [c.name, c._count.products])),
  };
}
