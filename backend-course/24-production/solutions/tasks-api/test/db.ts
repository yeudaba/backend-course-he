import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

// מסד בדיקות: schema חדש (ריק) לכל קובץ בדיקה, עם כל ה־migrations. בסוף — נמחק.
// ככה בדיקות לא נוגעות בנתוני הפיתוח, ולא אחת בשנייה.
export async function createTestDatabase() {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) throw new Error("חסר DATABASE_URL_TEST ב־.env (מסד נפרד לבדיקות — לא ה־DATABASE_URL של הפיתוח)");
  const schema = `test_${randomBytes(4).toString("hex")}`;
  const admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA "${schema}"`);
  await admin.query(`SET search_path TO "${schema}"`);
  const dir = path.join(__dirname, "..", "prisma", "migrations");
  for (const m of fs.readdirSync(dir).filter((d) => fs.statSync(path.join(dir, d)).isDirectory()).sort()) {
    await admin.query(fs.readFileSync(path.join(dir, m, "migration.sql"), "utf8"));
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url, options: `-c timezone=UTC -c search_path=${schema}` }, { schema }),
  });
  return {
    prisma,
    // בין בדיקות: טבלאות ריקות ו־ids מ־1
    async reset() {
      await admin.query("TRUNCATE users, tasks, refresh_tokens, idempotency_keys RESTART IDENTITY CASCADE");
    },
    async close() {
      await prisma.$disconnect();
      await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
      await admin.end();
    },
  };
}
