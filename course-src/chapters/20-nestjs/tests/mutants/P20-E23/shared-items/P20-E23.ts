// P20-E23: מתוקן — כל ה־state בתוך מופע ה־service
import { Body, Controller, Get, Injectable, Module, Post } from "@nestjs/common";

export interface CartItem {
  id: number;
  product: string;
  qty: number;
}

const SHARED: CartItem[] = [];
@Injectable()
export class CartService {
  private readonly items: CartItem[] = SHARED;
  private nextId = 1; // ← היה static: שייך למחלקה, לא למופע

  list() {
    return this.items;
  }

  add(product: string, qty: number) {
    const item = { id: this.nextId++, product, qty };
    this.items.push(item);
    return item;
  }
}

@Controller("cart")
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  list() {
    return this.cart.list();
  }

  @Post()
  add(@Body() body: { product: string; qty: number }) {
    return this.cart.add(body.product, body.qty);
  }
}

@Module({ controllers: [CartController], providers: [CartService] })
export class CartModule {}
