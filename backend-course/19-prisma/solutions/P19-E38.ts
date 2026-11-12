// P19-E38: שמות כל המוצרים
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function productNames(prisma: PrismaClient): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { name: true }, orderBy: { name: "asc" } });
  return rows.map((p) => p.name);
}
