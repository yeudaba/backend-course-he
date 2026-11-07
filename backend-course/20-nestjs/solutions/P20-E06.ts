// P20-E06
import { Controller, Get, Module, Query } from "@nestjs/common";

@Controller("hello")
export class HelloController {
  @Get()
  hello(@Query("name") name?: string) {
    return { message: `שלום ${name ? name : "אורח"}` };
  }
}

@Module({ controllers: [HelloController] })
export class HelloModule {}
