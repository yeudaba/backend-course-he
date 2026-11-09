// עוזר לבדיקות של יחידה 25.5 (MySQL): כל בדיקה מקבלת database נקי משלה, טוען אליו נתונים מ־files/,
// ומשווה את התוצאה של קובץ ה־SQL שלך לפתרון לדוגמה — כמו tools/sql.mjs, אבל מול MySQL.
// החיבור: COURSE_MYSQL_URL ב־.env של תיקיית הקורס (יחידה 25.5, קופסת 🧰)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

export const mysqlUrl = process.env.COURSE_MYSQL_URL || "mysql://root:course@localhost:3306";

// DECIMAL ← number, DATE/DATETIME ← מחרוזת (בלי הפתעות של אזור זמן), וכמה פקודות בקובץ אחד
const OPTIONS = { multipleStatements: true, decimalNumbers: true, dateStrings: true, supportBigNumbers: true, bigNumberStrings: false };

const chapterPath = (testUrl, ...parts) => path.join(path.dirname(fileURLToPath(testUrl)), "..", ...parts);

// התוצאה של הפקודה האחרונה (בקובץ עם כמה פקודות, mysql2 מחזיר מערך של תוצאות)
function lastResult(result, fields) {
  if (Array.isArray(fields) && fields.some((f) => Array.isArray(f) || f === undefined)) {
    for (let i = result.length - 1; i >= 0; i--) if (Array.isArray(result[i])) return result[i];
    return result[result.length - 1];
  }
  return result;
}

export async function connectAdmin() {
  try {
    return await mysql.createConnection({ uri: mysqlUrl, ...OPTIONS });
  } catch (err) {
    throw new Error(`אין חיבור ל־MySQL (${mysqlUrl.replace(/:[^:@/]*@/, ":***@")}): ${err.message}. הרץ את הקונטיינר (יחידה 25.5, קופסת 🧰) ובדוק את COURSE_MYSQL_URL ב־.env`);
  }
}

export async function mysqlSandbox(t, testUrl, seed) {
  const admin = await connectAdmin();
  const name = `chk_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
  await admin.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
  const conn = await mysql.createConnection({ uri: mysqlUrl, database: name, ...OPTIONS });
  const pools = [];
  t.after(async () => {
    for (const p of pools) await p.end().catch(() => {});
    await conn.end().catch(() => {});
    await admin.query(`DROP DATABASE IF EXISTS \`${name}\``).catch(() => {});
    await admin.end();
  });
  const seedSql = seed ? fs.readFileSync(chapterPath(testUrl, "files", seed), "utf8") : null;
  if (seedSql) await conn.query(seedSql);

  const db = {
    name,
    conn,
    url: (() => {
      const u = new URL(mysqlUrl);
      u.pathname = `/${name}`;
      return u.toString();
    })(),
    query: (sql, params) => conn.query(sql, params),
    rows: async (sql, params) => (await conn.query(sql, params))[0],
    // pool לאותו database — לבדיקות עם כמה חיבורים במקביל (נעילות, מרוצים)
    pool(connectionLimit = 10) {
      const p = mysql.createPool({ uri: mysqlUrl, database: name, connectionLimit, ...OPTIONS });
      pools.push(p);
      return p;
    },
    // מריץ את קובץ ה־SQL שלך (מ־starter) ומחזיר את התוצאה של הפקודה האחרונה
    async runFile(file) {
      const target = chapterPath(testUrl, process.env.CHECK_TARGET || "starter", file);
      const text = fs.readFileSync(target, "utf8");
      if (!text.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim()) throw new Error(`הקובץ ${file} ריק — כתוב בו את הפתרון שלך`);
      const [result, fields] = await conn.query(text);
      return lastResult(result, fields);
    },
    fileRows: (file) => db.runFile(file),
    // התוצאה של הפתרון לדוגמה, על עותק נקי של אותם נתונים
    async expectedRows(file) {
      const ref = `${name}_ref`;
      await admin.query(`CREATE DATABASE \`${ref}\``);
      const c = await mysql.createConnection({ uri: mysqlUrl, database: ref, ...OPTIONS });
      try {
        if (seedSql) await c.query(seedSql);
        const [result, fields] = await c.query(fs.readFileSync(chapterPath(testUrl, "solutions", file), "utf8"));
        return lastResult(result, fields);
      } finally {
        await c.end();
        await admin.query(`DROP DATABASE \`${ref}\``);
      }
    },
  };
  return db;
}
