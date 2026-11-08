import { Module } from "@nestjs/common";
import { IdempotencyModule } from "../idempotency/idempotency.module";
import { FakePaymentGateway, PAYMENT_GATEWAY } from "../payments/payment-gateway";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [IdempotencyModule],
  controllers: [OrdersController],
  providers: [OrdersService, { provide: PAYMENT_GATEWAY, useClass: FakePaymentGateway }],
})
export class OrdersModule {}
