// P22-E15 — עזר לבדיקות: schema זמני וריק לכל קובץ בדיקה, עם טבלת products. (לא משנים)
// משתמש ב־COURSE_DATABASE_URL מה־.env של תיקיית הקורס.
import { randomBytes } from "node:crypto";
import pg from "pg";

export async function createTestSchema() {
  const url = process.env.COURSE_DATABASE_URL;
  if (!url) throw new Error("חסר COURSE_DATABASE_URL (בקובץ .env של תיקיית הקורס)");
  const schema = `t_${randomBytes(4).toString("hex")}`;
  const admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`CREATE TABLE ${schema}.products (id SERIAL PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL)`);
  const pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}` });
  return {
    pool,
    // מרוקן את הטבלה ומאפס את ה־ids — לקרוא ב־beforeEach
    async reset() {
      await pool.query("TRUNCATE products RESTART IDENTITY");
    },
    async close() {
      await pool.end();
      await admin.query(`DROP SCHEMA ${schema} CASCADE`);
      await admin.end();
    },
  };
}
