// P20-E22: שלוש תקלות — הזמנה שלא קיימת ← 500 (ואחר כך 200), id לא תקין ← לא במבנה שלנו
import {
  ArgumentsHost, Catch, Controller, ExceptionFilter, Get, HttpException, Injectable, Module,
  NotFoundException, Param, ParseIntPipe,
} from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import type { Response } from "express";

@Catch(NotFoundException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const code = status === 404 ? "NOT_FOUND" : status === 400 ? "BAD_REQUEST" : "ERROR";
    res.json({ error: { code, message: exception.message } });
  }
}

@Injectable()
export class OrdersService {
  private readonly orders = [
    { id: 1, item: "Espresso cup" },
    { id: 2, item: "Milk jug" },
  ];

  findOne(id: number) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new Error(`הזמנה ${id} לא נמצאה`);
    return order;
  }
}

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.orders.findOne(id);
  }
}

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, { provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class OrdersModule {}
