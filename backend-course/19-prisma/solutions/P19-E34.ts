// P19-E34: db.ts — client אחד, ב־UTC
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../files/generated/prisma/client.ts";

export function createPrisma(url: string) {
  const adapter = new PrismaPg({ connectionString: url, options: "-c timezone=UTC" });
  return new PrismaClient({ adapter });
}
