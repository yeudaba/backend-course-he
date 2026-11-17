// P20-E65: אסטרטגיית תמחור לפי הגדרה
import { BadRequestException, Controller, Get, Inject, Module, Param, ParseFloatPipe } from "@nestjs/common";

export const CONFIG = "CONFIG";
export const PRICING = "PRICING";

export interface Pricing {
  name: string;
  price(base: number): number;
}

export class RegularPricing implements Pricing {
  name = "regular";
  price(base: number) {
    return base;
  }
}

export class HolidayPricing implements Pricing {
  name = "holiday";
  price(base: number) {
    return Math.round(Math.round(base * 100) * 0.85) / 100;
  }
}

@Controller("price")
export class PriceController {
  constructor(@Inject(PRICING) private readonly pricing: Pricing) {}

  @Get(":base")
  get(@Param("base", ParseFloatPipe) base: number) {
    if (!(base > 0)) throw new BadRequestException("base חייב להיות חיובי");
    return { base, final: this.pricing.price(base), strategy: this.pricing.name };
  }
}

@Module({
  controllers: [PriceController],
  providers: [
    { provide: CONFIG, useValue: { holiday: false } },
    {
      provide: PRICING,
      useFactory: (cfg: { holiday: boolean }) => (cfg.holiday ? new HolidayPricing() : new RegularPricing()),
      inject: [CONFIG],
    },
  ],
})
export class PricingModule {}
