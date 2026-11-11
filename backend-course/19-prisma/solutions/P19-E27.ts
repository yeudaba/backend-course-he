// P19-E27: עמוד מוצרים — רשימה וספירה במקביל
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export type ProductPage = {
  items: { id: number; name: string; price: number }[];
  page: number;
  total: number;
  pages: number;
};

export async function getProductPage(
  prisma: PrismaClient,
  { page = 1, pageSize = 5, categoryId }: { page?: number; pageSize?: number; categoryId?: number } = {},
): Promise<ProductPage> {
  if (!Number.isInteger(page) || page < 1) throw new RangeError("page חייב להיות מספר שלם חיובי");
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) throw new RangeError("pageSize חייב להיות 1–50");

  const where = { isActive: true, ...(categoryId !== undefined ? { categoryId } : {}) };
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: { id: true, name: true, price: true },
      orderBy: { id: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: rows.map((p) => ({ id: p.id, name: p.name, price: Number(p.price) })),
    page,
    total,
    pages: Math.ceil(total / pageSize),
  };
}
