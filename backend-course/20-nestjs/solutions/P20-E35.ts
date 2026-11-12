// P20-E35: ברכות בכמה שפות
import { Controller, Get, Injectable, Module, NotFoundException, Param } from "@nestjs/common";

@Injectable()
export class GreetingsService {
  private texts: Record<string, string> = { he: "שלום", en: "Hello", ar: "مرحبا" };

  greet(lang: string) {
    if (!Object.hasOwn(this.texts, lang)) throw new NotFoundException(`שפה ${lang} לא נתמכת`);
    return { lang, text: this.texts[lang] };
  }

  languages() {
    return Object.keys(this.texts).sort();
  }
}

@Controller("hello")
export class HelloController {
  constructor(private readonly greetings: GreetingsService) {}
  @Get(":lang")
  greet(@Param("lang") lang: string) {
    return this.greetings.greet(lang);
  }
}

@Controller("languages")
export class LanguagesController {
  constructor(private readonly greetings: GreetingsService) {}
  @Get()
  list() {
    return this.greetings.languages();
  }
}

@Module({ controllers: [HelloController, LanguagesController], providers: [GreetingsService] })
export class GreetingsModule {}
