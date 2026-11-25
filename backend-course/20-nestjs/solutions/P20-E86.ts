// P20-E86: תפריט ומחירים — controller ו־service
import { Controller, Get, Injectable, Module, Param } from "@nestjs/common";

@Injectable()
export class PricesService {
  readonly #prices = new Map([
    ["espresso", 9],
    ["latte", 14],
    ["cappuccino", 13],
  ]);

  menu(): string[] {
    return [...this.#prices.keys()].sort();
  }

  priceOf(name: string): number | null {
    return this.#prices.get(name) ?? null;
  }
}

@Controller("menu")
export class PricesController {
  constructor(private readonly prices: PricesService) {}

  @Get()
  menu() {
    return { items: this.prices.menu() };
  }

  @Get(":name")
  price(@Param("name") name: string) {
    const key = name.toLowerCase();
    return { name: key, price: this.prices.priceOf(key) };
  }
}

@Module({ controllers: [PricesController], providers: [PricesService] })
export class PricesModule {}
