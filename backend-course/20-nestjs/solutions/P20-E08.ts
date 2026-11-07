// P20-E08
import { Body, Controller, Get, Injectable, Module, Post } from "@nestjs/common";
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @Length(2, 80)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100_000)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export interface Product extends CreateProductDto {
  id: number;
  isActive: boolean;
}

@Injectable()
export class ProductsService {
  private readonly products: Product[] = [];
  private nextId = 1;

  list(): Product[] {
    return this.products;
  }

  create(dto: CreateProductDto): Product {
    const product: Product = { id: this.nextId++, name: dto.name, price: dto.price, stock: dto.stock, isActive: dto.isActive ?? true };
    this.products.push(product);
    return product;
  }
}

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list() {
    return this.products.list();
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }
}

@Module({ controllers: [ProductsController], providers: [ProductsService] })
export class ProductsModule {}
