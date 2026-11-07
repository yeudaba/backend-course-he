// P20-E13: OrdersService צריך את UsersService — מ־module אחר
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

@Module({ controllers: [UsersController], providers: [UsersService] })
export class UsersModule {}

// כתוב כאן OrdersService, OrdersController ו־OrdersModule

@Module({ imports: [UsersModule] })
export class AppModule {}
