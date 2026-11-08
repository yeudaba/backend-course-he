import { Injectable } from "@nestjs/common";
import { HttpError } from "../errors";
import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateProductInput, ListQuery, UpdateProductInput } from "./products.schema";

export const productFields = { id: true, name: true, description: true, priceCents: true, stock: true, category: true, createdAt: true, updatedAt: true } as const;

const ORDER_BY: Record<ListQuery["sort"], Prisma.ProductOrderByWithRelationInput[]> = {
  name: [{ name: "asc" }, { id: "asc" }],
  "-name": [{ name: "desc" }, { id: "asc" }],
  price: [{ priceCents: "asc" }, { id: "asc" }],
  "-price": [{ priceCents: "desc" }, { id: "asc" }],
  newest: [{ createdAt: "desc" }, { id: "desc" }],
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: ListQuery) {
    const where: Prisma.ProductWhereInput = {
      active: true,
      ...(q.category ? { category: q.category } : {}),
      ...(q.inStock === true ? { stock: { gt: 0 } } : q.inStock === false ? { stock: 0 } : {}),
      ...(q.minPrice !== undefined || q.maxPrice !== undefined ? { priceCents: { gte: q.minPrice, lte: q.maxPrice } } : {}),
      ...(q.q ? { OR: [{ name: { contains: q.q, mode: "insensitive" } }, { description: { contains: q.q, mode: "insensitive" } }] } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({ where, orderBy: ORDER_BY[q.sort], skip: (q.page - 1) * q.limit, take: q.limit, select: productFields }),
    ]);
    return { data, meta: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) } };
  }

  async get(id: number) {
    const product = await this.prisma.product.findFirst({ where: { id, active: true }, select: productFields });
    if (!product) throw new HttpError(404, "PRODUCT_NOT_FOUND", `מוצר ${id} לא נמצא`);
    return product;
  }

  create(input: CreateProductInput) {
    return this.prisma.product.create({ data: input, select: productFields });
  }

  async update(id: number, input: UpdateProductInput) {
    await this.get(id);
    return this.prisma.product.update({ where: { id }, data: input, select: productFields });
  }

  // מחיקה "רכה": מוצר שכבר הוזמן חייב להישאר (ההזמנות מצביעות עליו). הוא פשוט נעלם מהחנות ומהעגלות
  async remove(id: number) {
    await this.get(id);
    await this.prisma.$transaction([
      this.prisma.product.update({ where: { id }, data: { active: false } }),
      this.prisma.cartItem.deleteMany({ where: { productId: id } }),
    ]);
  }
}
