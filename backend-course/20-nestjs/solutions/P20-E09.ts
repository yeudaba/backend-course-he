// P20-E09
import { Body, Controller, Delete, Get, HttpCode, Injectable, Module, NotFoundException, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { PartialType } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString, Length, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @Length(2, 80)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export interface Product extends CreateProductDto {
  id: number;
}

@Injectable()
export class ProductsService {
  private readonly products: Product[] = [];
  private nextId = 1;

  create(dto: CreateProductDto): Product {
    const product = { id: this.nextId++, ...dto };
    this.products.push(product);
    return product;
  }

  findOne(id: number): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException(`מוצר ${id} לא נמצא`);
    return product;
  }

  update(id: number, dto: UpdateProductDto): Product {
    const product = this.findOne(id);
    Object.assign(product, dto);
    return product;
  }

  remove(id: number): void {
    this.findOne(id);
    this.products.splice(this.products.findIndex((p) => p.id === id), 1);
  }
}

@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.products.findOne(id);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseIntPipe) id: number) {
    this.products.remove(id);
  }
}

@Module({ controllers: [ProductsController], providers: [ProductsService] })
export class ProductsModule {}
