import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CartModule } from "./cart/cart.module";
import { ConfigModule } from "./config";
import { HealthController } from "./health.controller";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, ProductsModule, CartModule, OrdersModule],
  controllers: [HealthController],
})
export class AppModule {}
