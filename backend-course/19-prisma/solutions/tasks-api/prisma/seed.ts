// נתוני פיתוח:  npm run db:seed
import "dotenv/config";
import { createPrisma } from "../src/db.ts";

const prisma = createPrisma(process.env.DATABASE_URL!);
await prisma.task.deleteMany();
await prisma.task.createMany({
  data: [
    { title: "ללמוד Prisma", priority: "high", dueDate: new Date("2026-12-01") },
    { title: "לחבר את הדף ל־API", status: "in_progress" },
    { title: "לכתוב README", priority: "low", status: "done" },
  ],
});
console.log(`✔ ${await prisma.task.count()} משימות`);
await prisma.$disconnect();
