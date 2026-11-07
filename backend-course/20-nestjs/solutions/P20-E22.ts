// P20-E22: מתוקן
import {
  ArgumentsHost, Catch, Controller, ExceptionFilter, Get, HttpException, Injectable, Module,
  NotFoundException, Param, ParseIntPipe,
} from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import type { Response } from "express";

@Catch(HttpException) // ← תקלה 3: היה @Catch(NotFoundException), אז ה־400 של ParseIntPipe יצא במבנה של Nest
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const code = status === 404 ? "NOT_FOUND" : status === 400 ? "BAD_REQUEST" : "ERROR";
    res.status(status).json({ error: { code, message: exception.message } }); // ← תקלה 2: בלי status — 200
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
    if (!order) throw new NotFoundException(`הזמנה ${id} לא נמצאה`); // ← תקלה 1: Error רגיל הופך ל־500
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
