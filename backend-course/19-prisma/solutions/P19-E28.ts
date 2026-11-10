// P19-E28: repository לקטגוריות — interface, מחלקה ושגיאות משלך
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";

export type CategorySummary = { id: number; name: string; productCount: number };

export interface CategoryRepository {
  list(): Promise<CategorySummary[]>;
  create(name: string): Promise<CategorySummary>;
  rename(id: number, name: string): Promise<CategorySummary>;
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

const withCount = { id: true, name: true, _count: { select: { products: true } } } as const;
type Row = { id: number; name: string; _count: { products: number } };
const toSummary = (c: Row): CategorySummary => ({ id: c.id, name: c.name, productCount: c._count.products });

export class PrismaCategoryRepository implements CategoryRepository {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  async list(): Promise<CategorySummary[]> {
    const rows = await this.#prisma.category.findMany({ select: withCount, orderBy: { name: "asc" } });
    return rows.map(toSummary);
  }

  async create(name: string): Promise<CategorySummary> {
    const clean = this.#cleanName(name);
    try {
      return toSummary(await this.#prisma.category.create({ data: { name: clean }, select: withCount }));
    } catch (err) {
      throw this.#translate(err, clean);
    }
  }

  async rename(id: number, name: string): Promise<CategorySummary> {
    const clean = this.#cleanName(name);
    try {
      return toSummary(await this.#prisma.category.update({ where: { id }, data: { name: clean }, select: withCount }));
    } catch (err) {
      throw this.#translate(err, clean, id);
    }
  }

  #cleanName(name: string): string {
    const clean = name.trim();
    if (clean === "") throw new RangeError("שם קטגוריה ריק");
    return clean;
  }

  #translate(err: unknown, name: string, id?: number): unknown {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return err;
    switch (err.code) {
      case "P2002":
        return new ConflictError(`קטגוריה בשם ${name} כבר קיימת`);
      case "P2025":
        return new NotFoundError(`קטגוריה ${id} לא קיימת`);
      default:
        return err;
    }
  }
}
