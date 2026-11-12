// P19-E39: מ־pg ל־Prisma — מלאי נמוך
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function lowStock(prisma: PrismaClient, below: number) {
  return prisma.product.findMany({
    where: { isActive: true, stock: { lt: below } },
    select: { id: true, name: true, stock: true },
    orderBy: [{ stock: "asc" }, { id: "asc" }],
  });
}
