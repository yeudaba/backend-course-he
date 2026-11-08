// נתוני פיתוח:  npm run db:seed
// (עם pg ישירות: ה־client של Prisma בפרויקט Nest מיוצר כ־CommonJS, ו־Node לא מריץ אותו ישירות מ־.ts)
import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query("DELETE FROM tasks");
await client.query(`
  INSERT INTO tasks (title, status, priority, due_date) VALUES
    ('ללמוד NestJS', 'todo', 'high', '2026-12-01'),
    ('לחבר את הדף ל־API', 'in_progress', 'medium', NULL),
    ('לכתוב README', 'done', 'low', NULL)`);
const { rows } = await client.query("SELECT COUNT(*)::int AS n FROM tasks");
console.log(`✔ ${rows[0].n} משימות`);
await client.end();
