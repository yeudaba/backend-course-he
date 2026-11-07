// P20-E13
import { Body, Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post } from "@nestjs/common";

export interface User {
  id: number;
  name: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    { id: 1, name: "Dana" },
    { id: 2, name: "Yossi" },
  ];

  findById(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`משתמש ${id} לא נמצא`);
    return user;
  }
}

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.users.findById(id);
  }
}

@Module({ controllers: [UsersController], providers: [UsersService], exports: [UsersService] })
export class UsersModule {}

export interface Order {
  id: number;
  item: string;
  user: User;
}

@Injectable()
export class OrdersService {
  private readonly orders: Order[] = [];

  constructor(private readonly users: UsersService) {}

  create(userId: number, item: string): Order {
    const user = this.users.findById(userId); // 404 אם אין משתמש כזה
    const order = { id: this.orders.length + 1, item, user };
    this.orders.push(order);
    return order;
  }
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() body: { userId: number; item: string }) {
    return this.orders.create(body.userId, body.item);
  }
}

@Module({ imports: [UsersModule], controllers: [OrdersController], providers: [OrdersService] })
export class OrdersModule {}

@Module({ imports: [UsersModule, OrdersModule] })
export class AppModule {}
