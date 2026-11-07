// P20-E10
import { Controller, Get, Injectable, Module, Query } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListProductsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @IsOptional()
  @IsString()
  q?: string;
}

export interface Product {
  id: number;
  name: string;
}

@Injectable()
export class ProductsService {
  private readonly products: Product[] = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}` }));

  list({ page, limit, q }: ListProductsQuery) {
    const filtered = q ? this.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())) : this.products;
    const data = filtered.slice((page - 1) * limit, page * limit);
    return { data, meta: { page, limit, total: filtered.length, pages: Math.ceil(filtered.length / limit) } };
  }
}

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsQuery) {
    return this.products.list(query);
  }
}

@Module({ controllers: [ProductsController], providers: [ProductsService] })
export class ProductsModule {}
