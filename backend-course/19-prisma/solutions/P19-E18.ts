// P19-E18
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function setProductTags(prisma: PrismaClient, productId: number, names: string[]) {
  const clean = [...new Set(names.map((n) => n.trim().toLowerCase()).filter(Boolean))];
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new AppError("PRODUCT_NOT_FOUND");
    const tags = [];
    for (const name of clean) tags.push(await tx.tag.upsert({ where: { name }, create: { name }, update: {} }));
    await tx.productTag.deleteMany({ where: { productId } });
    await tx.productTag.createMany({ data: tags.map((t) => ({ productId, tagId: t.id })) });
    return tags.map((t) => t.name).sort();
  });
}
