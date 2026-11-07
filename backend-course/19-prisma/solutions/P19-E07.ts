// P19-E07
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function productsInCategory(prisma: PrismaClient, categoryName: string) {
  const rows = await prisma.product.findMany({
    where: { category: { name: categoryName } },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  return rows.map((p) => p.name);
}
