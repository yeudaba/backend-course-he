// הגדרות Prisma לפרק 19. מריצים מתוך התיקייה 19-prisma/files:  npx prisma migrate dev / npx prisma generate
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: "../../.env" }); // ה־.env של תיקיית הקורס (פרק 16)

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.ts",
  },
  datasource: {
    url: process.env.SHOP_DATABASE_URL,
  },
});
