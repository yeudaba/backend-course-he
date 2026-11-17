// P20-E55: הזמנה עם פריטים — DTO מקונן
import { BadRequestException, Body, Controller, Module, Post } from "@nestjs/common";
import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsInt, IsNumber, Matches, Max, Min, ValidateNested } from "class-validator";

export class OrderItemDto {
  @Matches(/^[A-Z]{3}-\d{3}$/)
  sku: string;

  @IsInt()
  @Min(1)
  @Max(99)
  qty: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;
}

export class CreateOrderDto {
  @IsEmail()
  customerEmail: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

@Controller("orders")
export class OrdersController {
  private nextId = 1;

  @Post()
  create(@Body() dto: CreateOrderDto) {
    const seen = new Set<string>();
    for (const i of dto.items) {
      if (seen.has(i.sku)) throw new BadRequestException(`sku כפול: ${i.sku}`);
      seen.add(i.sku);
    }
    const cents = dto.items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.qty, 0);
    const items = dto.items.map((i) => ({ sku: i.sku, qty: i.qty, price: i.price }));
    return { id: this.nextId++, customerEmail: dto.customerEmail, items, total: cents / 100 };
  }
}

@Module({ controllers: [OrdersController] })
export class OrdersModule {}
