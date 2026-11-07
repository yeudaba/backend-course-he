import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

export function createPrisma(connectionString: string) {
  // timezone=UTC: בלי זה Prisma 7 קורא/כותב timestamptz עם הפרש של אזור הזמן (פרק 19, שיעור 1)
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, options: "-c timezone=UTC" }) });
}
