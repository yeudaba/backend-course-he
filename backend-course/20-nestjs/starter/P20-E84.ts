// P20-E84: שני modules — האפליקציה לא עולה, ואחר כך /status ו־/greetings/he מחזירים 404. שלוש תקלות.
// GET /greetings/:lang ← { text } ("he" ← "שלום", אחרת "Hello") · GET /status ← { status: "ok" }
//
// בדיקה:  npm run check P20-E84
import { Controller, Get, Injectable, Module, Param } from "@nestjs/common";

@Injectable()
export class GreetingsService {
  greet(lang: string) {
    return lang === "he" ? "שלום" : "Hello";
  }
}

@Controller("greeting")
export class GreetingsController {
  constructor(private readonly greetings: GreetingsService) {}

  @Get(":lang")
  get(@Param("lang") lang: string) {
    return { text: this.greetings.greet(lang) };
  }
}

@Module({ controllers: [GreetingsController] })
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

@Module({ imports: [GreetingsModule] })
export class AppModule {}
