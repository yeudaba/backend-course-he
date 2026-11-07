// P20-E23: באפליקציה אחת הכול עובד. אבל כשהבדיקות יוצרות כמה אפליקציות — המידע דולף ביניהן
import { Body, Controller, Get, Injectable, Module, Post } from "@nestjs/common";

export interface CartItem {
  id: number;
  product: string;
  qty: number;
}

const items: CartItem[] = [];

@Injectable()
export class CartService {
  static nextId = 1;

  list() {
    return items;
  }

  add(product: string, qty: number) {
    const item = { id: CartService.nextId++, product, qty };
    items.push(item);
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
