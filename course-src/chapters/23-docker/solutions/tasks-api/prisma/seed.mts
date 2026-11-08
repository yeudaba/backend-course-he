// נתוני פיתוח:  npm run db:seed
// (עם pg ישירות: ה־client של Prisma בפרויקט Nest מיוצר כ־CommonJS, ו־Node לא מריץ אותו ישירות מ־.ts)
import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

// סיסמאות לפיתוח בלבד — מופיעות גם ב־README וב־requests.http
const USERS = [
  { email: "dana@example.com", password: "dana-password-1", role: "user" },
  { email: "yossi@example.com", password: "yossi-password-1", role: "user" },
  { email: "admin@example.com", password: "admin-password-1", role: "admin" },
];

const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query("DELETE FROM users"); // ON DELETE CASCADE מוחק גם משימות ו־refresh tokens
const ids: Record<string, number> = {};
for (const u of USERS) {
  const hash = await bcrypt.hash(u.password, rounds);
  const { rows } = await client.query("INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id", [u.email, hash, u.role]);
  ids[u.email] = rows[0].id;
}
await client.query(
  `INSERT INTO tasks (owner_id, title, status, priority, due_date) VALUES
    ($1, 'ללמוד NestJS', 'todo', 'high', '2026-12-01'),
    ($1, 'לחבר את הדף ל־API', 'in_progress', 'medium', NULL),
    ($2, 'לכתוב README', 'done', 'low', NULL)`,
  [ids["dana@example.com"], ids["yossi@example.com"]],
);
const { rows } = await client.query("SELECT (SELECT COUNT(*) FROM users)::int AS users, (SELECT COUNT(*) FROM tasks)::int AS tasks");
console.log(`✔ ${rows[0].users} משתמשים, ${rows[0].tasks} משימות`);
await client.end();
