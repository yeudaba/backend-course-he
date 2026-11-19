// עוזר לבדיקות של פרקי SQL (16–18): כל בדיקה מקבלת schema נקי משלה במסד שלך, וטוענת אליו נתונים.
// החיבור: COURSE_DATABASE_URL מהקובץ .env בתיקיית הקורס (פרק 16, קופסת 🧰).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import pg from "pg";
import { assertSameRows, parseVariants, splitSql } from "./rows.mjs";

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
    // קודם החיבורים הנוספים — שלא יחזיקו נעילות על ה־schema. חיבור שהקוד שלך לא שחרר (בלי release)
    // היה משאיר את p.end() ואת הבדיקה תקועים — אז אחרי חצי שנייה מנתקים אותו בכוח
    const ended = await Promise.race([Promise.all(pools.map((p) => p.end().catch(() => {}))).then(() => true), new Promise((r) => setTimeout(() => r(false), 500))]);
    if (!ended) await client.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE application_name = $1", [schema]).catch(() => {});
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`).catch(() => {});
    await client.end();
  });
  if (seed) await client.query(fs.readFileSync(chapterPath(testUrl, "files", seed), "utf8"));

  const db = {
    schema,
    client,
    // Pool של חיבורים לאותו schema — לבדיקות של כמה חיבורים במקביל (פרק 18)
    pool(max = 10) {
      const p = new pg.Pool({ connectionString: url, max, options: `-c search_path=${schema}`, application_name: schema });
      // חיבור שנותק (בסוף הבדיקה) לא מפיל את התהליך
      p.on("error", () => {});
      p.on("connect", (c) => c.on("error", () => {}));
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

// מזיז חצי מהשורות של כל טבלה לסוף הקובץ הפיזי (UPDATE שלא משנה ערך) — כך שאילתה בלי ORDER BY
// מחזירה סדר אחר מסדר ההכנסה. mode 0/1 — אילו שורות זזות (זוגיות/אי־זוגיות)
async function shuffle(client, schema, mode = 0) {
  const tables = (await client.query(
    `SELECT c.table_name, MIN(c.column_name) FILTER (WHERE c.is_identity = 'NO' AND c.is_generated = 'NEVER') AS col
     FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
     WHERE c.table_schema = $1 AND t.table_type = 'BASE TABLE' GROUP BY c.table_name`, [schema])).rows;
  for (const { table_name: tb, col } of tables) {
    if (!col) continue;
    await client.query(`UPDATE "${tb}" SET "${col}" = "${col}" WHERE ctid IN (SELECT ctid FROM (SELECT ctid, row_number() OVER (ORDER BY ctid) AS rn FROM "${tb}") s WHERE rn % 2 = ${mode})`);
  }
}

const resultOf = (res) => (Array.isArray(res) ? res.at(-1) : res);

// הבודק הסטנדרטי לשאלות SQL: מריץ את הקובץ שלך ואת הפתרון לדוגמה, כל אחד ב־schema נקי, על כמה מערכי נתונים:
//   1. קובץ הנתונים (seed) כמו שהוא;
//   2. כל קטע ב־files/<seed>.variants.sql (נתונים נוספים ושינויים — כדי שתשובה "מועתקת" או WHERE id IN (...) לא יעברו),
//      ואחרי כל קטע השורות מוזזות פיזית (כדי ש־ORDER BY חסר ייתפס);
//   3. changes — שינויים ספציפיים לשאלה: [["תיאור", "SQL"], ...].
// after: לקובץ שבונה טבלה בעצמו — SQL שרץ אחרי הקובץ שלך, ואז הפקודה האחרונה בקובץ רצה שוב.
// אם יש הבדל — הודעה עם רמז (מה חסר / עודף / הסדר), בלי להציג את כל התשובה.
export async function sameAsSolution(t, testUrl, file, { seed, changes = [], variants = true, after } = {}) {
  const solutionText = fs.readFileSync(chapterPath(testUrl, "solutions", file), "utf8");
  const sets = [{ label: seed ? `על הנתונים של ${seed}` : "", sql: "" }];
  const vfile = seed && chapterPath(testUrl, "files", seed.replace(/\.sql$/, ".variants.sql"));
  if (variants && vfile && fs.existsSync(vfile)) {
    const vs = parseVariants(fs.readFileSync(vfile, "utf8"));
    vs.forEach((sql, i) => sets.push({ label: `על נתונים נוספים שהבודק מוסיף (בדיקה נסתרת ${i + 1} מתוך ${vs.length})`, sql, shuffle: true }));
  }
  for (const [label, sql] of changes) sets.push({ label, sql, shuffle: true });

  const run = async (text, set, mode) => {
    const db = await sandbox(t, testUrl, seed);
    if (set.sql) await db.query(set.sql);
    if (mode !== undefined) await shuffle(db.client, db.schema, mode);
    let res = resultOf(await db.client.query(text));
    if (after) {
      await db.query(after);
      res = resultOf(await db.client.query(splitSql(text).at(-1)));
    }
    return { rows: res?.rows ?? [], columns: (res?.fields ?? []).map((f) => f.name) };
  };
  const mineText = () => {
    const target = chapterPath(testUrl, process.env.CHECK_TARGET || "starter", file);
    const text = fs.readFileSync(target, "utf8");
    if (!text.replace(/--.*$/gm, "").trim()) throw new Error(`הקובץ ${file} ריק — כתוב בו את הפתרון שלך`);
    return text;
  };
  const text = mineText();
  for (const set of sets) {
    const mode = set.shuffle ? 0 : undefined;
    let got;
    try {
      got = await run(text, set, mode);
    } catch (err) {
      if (!set.sql) throw err;
      assert.fail(`${set.label}: השאילתה שלך נכשלה — ${err.message}`);
    }
    const exp = await run(solutionText, set, mode);
    // אם הפתרון עצמו מחזיר סדר אחר כשהשורות זזות — הסדר לא מוגדר בשאלה, ולא בודקים אותו
    let ordered = true;
    if (rowsKey(got.rows) !== rowsKey(exp.rows)) {
      const exp2 = await run(solutionText, set, mode === 0 ? 1 : 0);
      ordered = rowsKey(exp2.rows) === rowsKey(exp.rows);
    }
    assertSameRows(got.rows, exp.rows, set.label, { gotColumns: got.columns, expectedColumns: exp.columns, ordered });
  }
}
const rowsKey = (rows) => JSON.stringify(rows);
