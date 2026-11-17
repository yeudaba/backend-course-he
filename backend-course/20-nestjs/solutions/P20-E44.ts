// P20-E44: service אסינכרוני — 404 ו־500
import { Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe, Query } from "@nestjs/common";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class UsersService {
  private users = [
    { id: 1, name: "Dana" },
    { id: 2, name: "Yossi" },
  ];

  async findOne(id: number) {
    await sleep(20);
    if (id === 13) throw new Error("db timeout");
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`משתמש ${id} לא נמצא`);
    return user;
  }

  async findMany(ids: number[]) {
    const found = await Promise.all(
      ids.map((id) => this.findOne(id).catch((e) => (e instanceof NotFoundException ? null : Promise.reject(e)))),
    );
    return found.filter((u) => u !== null);
  }
}

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  many(@Query("ids") ids = "") {
    return this.users.findMany(ids.split(",").filter((s) => s !== "").map(Number));
  }

  @Get(":id")
  one(@Param("id", ParseIntPipe) id: number) {
    return this.users.findOne(id);
  }
}

@Module({ controllers: [UsersController], providers: [UsersService] })
export class UsersModule {}
