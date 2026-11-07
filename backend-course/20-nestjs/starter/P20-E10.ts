// P20-E10: GET /products?page=&limit=&q= ← { data, meta: { page, limit, total, pages } }
import { Controller, Get, Injectable, Module, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListProductsQuery {
  // page: שלם ≥ 1, ברירת מחדל 1 | limit: שלם 1–50, ברירת מחדל 10 | q: מחרוזת אופציונלית
}

export interface Product {
  id: number;
  name: string;
}

@Injectable()
export class ProductsService {
  private readonly products: Product[] = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}` }));
  // כתוב כאן list(query)
}

// כתוב כאן ProductsController

@Module({ controllers: [], providers: [ProductsService] })
export class ProductsModule {}
