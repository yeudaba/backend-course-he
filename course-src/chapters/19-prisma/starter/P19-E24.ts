// P19-E24 — אתגר: PrismaProductsRepository (הפירוט בדף התרגילים)
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

export class PrismaProductsRepository /* implements ProductsRepository */ {
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  // כתוב כאן: list, get, create, update, remove
}
