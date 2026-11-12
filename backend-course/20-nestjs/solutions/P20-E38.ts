// P20-E38: מחיר עם מע״מ
import { Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe } from "@nestjs/common";

@Injectable()
export class PricesService {
  private products = [
    { id: 1, price: 89.9 },
    { id: 2, price: 19.9 },
    { id: 3, price: 0.1 },
  ];
  private readonly vatRate = 0.18;

  withVat(id: number) {
    const p = this.products.find((x) => x.id === id);
    if (!p) throw new NotFoundException(`מוצר ${id} לא נמצא`);
    const cents = Math.round(p.price * 100);
    const vatCents = Math.round(cents * this.vatRate);
    return { id, price: p.price, vat: vatCents / 100, total: (cents + vatCents) / 100 };
  }
}

@Controller("prices")
export class PricesController {
  constructor(private readonly prices: PricesService) {}
  @Get(":id")
  get(@Param("id", ParseIntPipe) id: number) {
    return this.prices.withVat(id);
  }
}

@Module({ controllers: [PricesController], providers: [PricesService] })
export class PricesModule {}
