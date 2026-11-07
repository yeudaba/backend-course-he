import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnApplicationShutdown {
  constructor() {
    // timezone=UTC — פרק 19, שיעור 1
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, options: "-c timezone=UTC" }) });
  }

  // פרק 24: onApplicationShutdown ולא onModuleDestroy. Nest קורא ל־onModuleDestroy *לפני* שהוא סוגר את שרת ה־HTTP —
  // ובקשה שבאמצע מקבלת 500 כי המסד כבר סגור. onApplicationShutdown רץ אחרי שכל הבקשות הסתיימו
  async onApplicationShutdown() {
    await this.$disconnect();
  }
}
