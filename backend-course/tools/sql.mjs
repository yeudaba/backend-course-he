// עוזר לבדיקות של פרקי SQL (16–18): כל בדיקה מקבלת schema נקי משלה במסד שלך, וטוענת אליו נתונים.
// החיבור: COURSE_DATABASE_URL מהקובץ .env בתיקיית הקורס (פרק 16, קופסת 🧰).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import pg from "pg";

// מספרים גדולים ו־numeric ← number; DATE ← מחרוזת "2026-11-01" (בלי הפתעות של אזור זמן)
pg.types.setTypeParser(20, Number);
pg.types.setTypeParser(1700, Number);
pg.types.setTypeParser(1082, (v) => v);

const url = process.env.COURSE_DATABASE_URL || "postgresql://localhost:5432/course";

function chapterPath(testUrl, ...parts) {
  return path.join(path.dirname(fileURLToPath(testUrl)), "..", ...parts);
}

// const db = await sandbox(t, import.meta.url, "shop.sql")  ← schema חדש עם הנתונים מ־files/shop.sql
export async function sandbox(t, testUrl, seed) {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
  } catch (err) {
    throw new Error(`אין חיבור למסד (${url.replace(/:[^:@/]*@/, ":***@")}): ${err.message}. בדוק ש־PostgreSQL רץ ושה־COURSE_DATABASE_URL ב־.env נכון (פרק 16, קופסת 🧰).`);
  }
  const schema = `chk_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
  await client.query(`CREATE SCHEMA ${schema}; SET search_path TO ${schema}`);
  const pools = [];
  const prismas = [];
  t.after(async () => {
    for (const p of prismas) await p.$disconnect();
    for (const p of pools) await p.end(); // קודם החיבורים הנוספים — שלא יחזיקו נעילות על ה־schema
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`).catch(() => {});
    await client.end();
  });
  if (seed) await client.query(fs.readFileSync(chapterPath(testUrl, "files", seed), "utf8"));

  const db = {
    schema,
    client,
    // Pool של חיבורים לאותו schema — לבדיקות של כמה חיבורים במקביל (פרק 18)
    pool(max = 10) {
      const p = new pg.Pool({ connectionString: url, max, options: `-c search_path=${schema}` });
      pools.push(p);
      return p;
    },
    // Prisma Client (פרק 19) שעובד על ה־schema של הבדיקה. clientPath — ברירת מחדל: files/generated/prisma של הפרק
    async prisma({ clientPath = chapterPath(testUrl, "files", "generated", "prisma", "client.ts"), log } = {}) {
      if (!fs.existsSync(clientPath)) {
        throw new Error(`לא נמצא Prisma Client ב־${clientPath}. הרץ npx prisma generate (פרק 19, קופסת 🧰)`);
      }
      const { PrismaClient } = await import(pathToFileURL(clientPath).href);
      const { PrismaPg } = await import("@prisma/adapter-pg");
      // timezone=UTC — ראה פרק 19, שיעור 1. search_path — גם ל־$queryRaw (ה־schema של Prisma חל רק על השאילתות שהוא מייצר)
      const options = `-c timezone=UTC -c search_path=${schema}`;
      const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, options }, { schema }), log });
      prismas.push(prisma);
      return prisma;
    },
    // מריץ את כל קובצי ה־migration.sql שבתיקייה (לפי הסדר) על ה־schema של הבדיקה
    async applyMigrations(migrationsDir = chapterPath(testUrl, "files", "prisma", "migrations")) {
      const dirs = fs.readdirSync(migrationsDir).filter((d) => fs.existsSync(path.join(migrationsDir, d, "migration.sql"))).sort();
      if (dirs.length === 0) throw new Error(`אין migrations ב־${migrationsDir}`);
      for (const d of dirs) await client.query(fs.readFileSync(path.join(migrationsDir, d, "migration.sql"), "utf8"));
    },
    async runSql(file) {
      await client.query(fs.readFileSync(file, "utf8"));
    },
    query: (text, params) => client.query(text, params),
    rows: async (text, params) => (await client.query(text, params)).rows,
    // מריץ את קובץ ה־SQL שלך (מ־starter) ומחזיר את התוצאה של הפקודה האחרונה
    async runFile(file) {
      const target = chapterPath(testUrl, process.env.CHECK_TARGET || "starter", file);
      const text = fs.readFileSync(target, "utf8");
      if (!text.replace(/--.*$/gm, "").trim()) throw new Error(`הקובץ ${file} ריק — כתוב בו את הפתרון שלך`);
      const result = await client.query(text);
      const last = Array.isArray(result) ? result.at(-1) : result;
      return last;
    },
    async fileRows(file) {
      return (await db.runFile(file)).rows;
    },
    // התוצאה של פתרון לדוגמה (מתיקיית solutions), על עותק נקי של אותם נתונים
    async expectedRows(file) {
      const temp = `${schema}_ref`;
      await client.query(`CREATE SCHEMA ${temp}; SET search_path TO ${temp}`);
      try {
        if (seed) await client.query(fs.readFileSync(chapterPath(testUrl, "files", seed), "utf8"));
        const result = await client.query(fs.readFileSync(chapterPath(testUrl, "solutions", file), "utf8"));
        return (Array.isArray(result) ? result.at(-1) : result).rows;
      } finally {
        await client.query(`SET search_path TO ${schema}; DROP SCHEMA ${temp} CASCADE`);
      }
    },
  };
  return db;
}
