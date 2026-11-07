import "dotenv/config";
import { createApp } from "./app.ts";
import { createPrisma } from "./db.ts";
import { PrismaTasksRepository } from "./tasks/tasks.prisma-repository.ts";

const port = Number(process.env.PORT ?? 3000);
if (!process.env.DATABASE_URL) throw new Error("חסר DATABASE_URL (ראה README)");
const prisma = createPrisma(process.env.DATABASE_URL);

createApp({
  repository: new PrismaTasksRepository(prisma),
  log: console.log,
  corsOrigins: process.env.CORS_ORIGINS?.split(","),
}).listen(port, () => {
  console.log(`tasks-api רץ: http://localhost:${port}`);
});
