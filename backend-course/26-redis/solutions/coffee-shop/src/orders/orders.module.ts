import { Module } from "@nestjs/common";
import { EmailsController } from "../emails/emails.controller";
import { EmailsService } from "../emails/emails.service";
import { IdempotencyModule } from "../idempotency/idempotency.module";
import { JobsProcessor } from "../jobs/jobs.processor";
import { JobsService } from "../jobs/jobs.service";
import { FakePaymentGateway, PAYMENT_GATEWAY } from "../payments/payment-gateway";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [IdempotencyModule],
  controllers: [OrdersController, EmailsController],
  providers: [OrdersService, EmailsService, JobsService, JobsProcessor, { provide: PAYMENT_GATEWAY, useClass: FakePaymentGateway }],
})
export class OrdersModule {}
