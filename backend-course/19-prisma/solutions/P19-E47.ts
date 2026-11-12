// P19-E47: אותה שאילתה — ב־pg וב־Prisma
import type { Pool } from "pg";
import type { PrismaClient } from "../files/generated/prisma/client.ts";

type Row = { id: number; name: string; stock: number };

export async function cheapWithPg(pool: Pool, max: number): Promise<Row[]> {
  const { rows } = await pool.query(
    "SELECT id, name, stock FROM products WHERE is_active AND price < $1 ORDER BY price, id",
    [max],
  );
  return rows;
}

export async function cheapWithPrisma(prisma: PrismaClient, max: number): Promise<Row[]> {
  return prisma.product.findMany({
    where: { isActive: true, price: { lt: max } },
    select: { id: true, name: true, stock: true },
    orderBy: [{ price: "asc" }, { id: "asc" }],
  });
}
