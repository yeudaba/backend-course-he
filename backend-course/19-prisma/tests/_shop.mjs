// עזר לבדיקות של פרק 19: schema זמני עם הטבלאות (מה־migrations של הפרק), נתוני הדוגמה, ו־Prisma Client
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sandbox } from "../../tools/sql.mjs";

export async function shop(t, testUrl, { log } = {}) {
  const db = await sandbox(t, testUrl);
  await db.applyMigrations();
  await db.runSql(path.join(path.dirname(fileURLToPath(testUrl)), "..", "files", "prisma", "seed.sql"));
  const queries = [];
  const prisma = await db.prisma({ log: log ? [{ emit: "event", level: "query" }] : undefined });
  if (log) prisma.$on("query", (e) => queries.push(e.query));
  return { db, prisma, queries };
}
