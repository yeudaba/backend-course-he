import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// Global: כל module יכול לקבל PrismaService בלי לייבא את PrismaModule
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
