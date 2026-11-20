// P20-E84: שני modules — מתוקן
import { Controller, Get, Injectable, Module, Param } from "@nestjs/common";

@Injectable()
export class GreetingsService {
  greet(lang: string) {
    return lang === "he" ? "שלום" : "Hello";
  }
}

@Controller("greetings")
export class GreetingsController {
  constructor(private readonly greetings: GreetingsService) {}

  @Get(":lang")
  get(@Param("lang") lang: string) {
    return { text: this.greetings.greet(lang) };
  }
}

@Module({ controllers: [GreetingsController], providers: [GreetingsService] })
export class GreetingsModule {}

@Controller("status")
export class StatusController {
  @Get()
  get() {
    return { status: "ok" };
  }
}

@Module({ controllers: [StatusController] })
export class StatusModule {}

@Module({ imports: [GreetingsModule, StatusModule] })
export class AppModule {}
