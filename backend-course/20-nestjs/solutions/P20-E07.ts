// P20-E07
import { Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe } from "@nestjs/common";

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable()
export class ProductsService {
  private readonly products: Product[] = [
    { id: 1, name: "Espresso cup", price: 24.9 },
    { id: 2, name: "Hand grinder", price: 189 },
    { id: 3, name: "Milk jug", price: 59.5 },
  ];

  list(): Product[] {
    return this.products;
  }

  findOne(id: number): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException(`מוצר ${id} לא נמצא`);
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

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.products.findOne(id);
  }
}

@Module({ controllers: [ProductsController], providers: [ProductsService] })
export class ProductsModule {}
