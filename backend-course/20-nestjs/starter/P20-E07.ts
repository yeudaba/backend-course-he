// P20-E07: GET /products, GET /products/:id (ParseIntPipe, 404 עם "מוצר 99 לא נמצא")
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
  // כתוב כאן list() ו־findOne(id)
}

// כתוב כאן ProductsController

@Module({ controllers: [], providers: [ProductsService] })
export class ProductsModule {}
