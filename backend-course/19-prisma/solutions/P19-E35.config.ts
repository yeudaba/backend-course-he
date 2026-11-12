// P19-E35: prisma.config.ts לפרויקט אחר
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "db/schema.prisma",
  migrations: {
    path: "db/migrations",
    seed: "node db/seed.ts",
  },
  datasource: {
    url: process.env.APP_DATABASE_URL,
  },
});
