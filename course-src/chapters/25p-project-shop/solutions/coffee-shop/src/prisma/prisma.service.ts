import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { pgConnectionOptions } from "./pg-options";

@Injectable()
export class PrismaService extends PrismaClient implements OnApplicationShutdown {
  constructor() {
    super({ adapter: new PrismaPg({ ...pgConnectionOptions(process.env.DATABASE_URL ?? ""), options: "-c timezone=UTC" }) });
  }

  // אחרי שהשרת סיים את הבקשות שבאמצע (פרק 24)
  async onApplicationShutdown() {
    await this.$disconnect();
  }
}
