// P19-E82: חיפוש לקוחות בכמה שדות
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function searchCustomers(prisma: PrismaClient, q: string) {
  const text = q.trim();
  if (text === "") return [];
  const like = { contains: text, mode: "insensitive" as const };
  return prisma.customer.findMany({
    where: { OR: [{ fullName: like }, { email: like }, { city: like }] },
    select: { id: true, fullName: true },
    orderBy: [{ fullName: "asc" }, { id: "asc" }],
  });
}
