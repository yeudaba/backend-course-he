// P19-E81: עדכון חלקי של מוצר
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";

export type ApiProduct = { id: number; name: string; price: number; stock: number; isActive: boolean };

export async function updateProduct(prisma: PrismaClient, id: number, changes: Partial<Omit<ApiProduct, "id">>): Promise<ApiProduct | undefined> {
  try {
    const p = await prisma.product.update({
      where: { id },
      data: { name: changes.name, price: changes.price, stock: changes.stock, isActive: changes.isActive },
      select: { id: true, name: true, price: true, stock: true, isActive: true },
    });
    return { ...p, price: Number(p.price) };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") return undefined;
    throw err;
  }
}
