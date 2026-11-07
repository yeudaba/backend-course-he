// P19-E24
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export interface Product { id: number; name: string; category: string; price: number; stock: number; isActive: boolean }
export interface ListOptions { category?: string; q?: string; inStock?: boolean; sort?: "price" | "-price" | "name"; page?: number; limit?: number }

export interface ProductsRepository {
  list(options: ListOptions): Promise<{ data: Product[]; total: number }>;
  get(id: number): Promise<Product | undefined>;
  create(data: { name: string; category: string; price: number; stock: number }): Promise<Product>;
  update(id: number, changes: Partial<Omit<Product, "id">>): Promise<Product | undefined>;
  remove(id: number): Promise<boolean>;
}

const withCategory = { category: { select: { name: true } } } as const;
type Row = Prisma.ProductGetPayload<{ include: typeof withCategory }>;

const toProduct = (r: Row): Product => ({
  id: r.id,
  name: r.name,
  category: r.category.name,
  price: Number(r.price),
  stock: r.stock,
  isActive: r.isActive,
});

const code = (err: unknown) => (err instanceof Prisma.PrismaClientKnownRequestError ? err.code : undefined);

export class PrismaProductsRepository implements ProductsRepository {
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async list({ category, q, inStock, sort = "name", page = 1, limit = 10 }: ListOptions) {
    const where: Prisma.ProductWhereInput = {
      ...(category ? { category: { name: category } } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(inStock ? { stock: { gt: 0 } } : {}),
    };
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [
      sort === "name" ? { name: "asc" } : { price: sort === "price" ? "asc" : "desc" },
      { id: "asc" },
    ];
    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({ where, orderBy, include: withCategory, skip: (page - 1) * limit, take: limit }),
      this.prisma.product.count({ where }),
    ]);
    return { data: rows.map(toProduct), total };
  }

  async get(id: number) {
    const row = await this.prisma.product.findUnique({ where: { id }, include: withCategory });
    return row ? toProduct(row) : undefined;
  }

  async create({ name, category, price, stock }: { name: string; category: string; price: number; stock: number }) {
    try {
      const row = await this.prisma.product.create({
        data: { name, price, stock, category: { connect: { name: category } } },
        include: withCategory,
      });
      return toProduct(row);
    } catch (err) {
      if (code(err) === "P2025") throw new AppError("CATEGORY_NOT_FOUND");
      throw err;
    }
  }

  async update(id: number, { category, ...rest }: Partial<Omit<Product, "id">>) {
    const exists = await this.prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return undefined;
    try {
      const row = await this.prisma.product.update({
        where: { id },
        data: { ...rest, ...(category ? { category: { connect: { name: category } } } : {}) },
        include: withCategory,
      });
      return toProduct(row);
    } catch (err) {
      if (code(err) === "P2025") throw new AppError("CATEGORY_NOT_FOUND");
      throw err;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.product.delete({ where: { id } });
      return true;
    } catch (err) {
      if (code(err) === "P2025") return false;
      if (code(err) === "P2003") throw new AppError("PRODUCT_HAS_ORDERS");
      throw err;
    }
  }
}
