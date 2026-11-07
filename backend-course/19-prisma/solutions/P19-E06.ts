// P19-E06
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function activeProducts(prisma: PrismaClient) {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { name: true, price: true },
    orderBy: { price: "asc" },
  });
  return rows.map((p) => ({ name: p.name, price: Number(p.price) }));
}
