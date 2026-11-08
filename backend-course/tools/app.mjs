// בודק "קופסה שחורה" לפרויקט 3: מריץ את השרת שלך (dist/main.js) מול מסד חדש ונקי, ובודק דרך HTTP בלבד.
// לא תלוי בשמות הקבצים או במבנה הפנימי — רק בחוזה של ה־API.
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import pg from "pg";
import { target, api } from "./load.mjs";

pg.types.setTypeParser(20, Number);

const adminUrl = process.env.COURSE_DATABASE_URL || "postgresql://localhost:5432/course";
export const ADMIN = { email: "admin@shop.test", password: "admin-password-123" };

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer().listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });
}

export function projectDir(testUrl, name = "coffee-shop") {
  return path.dirname(target(testUrl, `${name}/package.json`));
}

// מסד חדש ← prisma migrate deploy (של הפרויקט שלך) ← node dist/main.js ← מחכים ל־/health
export async function startApp(t, testUrl, { env = {}, name = "coffee-shop" } = {}) {
  const dir = projectDir(testUrl, name);
  if (!fs.existsSync(path.join(dir, "package.json"))) throw new Error(`לא נמצא פרויקט ב־${dir}. הרץ עם --dir ~/dev/${name}`);
  if (!fs.existsSync(path.join(dir, "dist", "main.js"))) throw new Error("לא נמצא dist/main.js — הרץ npx prisma generate ואז npm run build בתיקיית הפרויקט");

  const admin = new pg.Client({ connectionString: adminUrl });
  try {
    await admin.connect();
  } catch (err) {
    throw new Error(`אין חיבור ל־PostgreSQL (COURSE_DATABASE_URL): ${err.message}`);
  }
  const dbName = `chk_shop_${process.pid}_${randomBytes(3).toString("hex")}`;
  await admin.query(`CREATE DATABASE ${dbName}`);
  const u = new URL(adminUrl);
  u.pathname = `/${dbName}`;
  const databaseUrl = u.toString();
  let child;
  let db;
  t.after(async () => {
    if (child && child.exitCode === null) {
      const exited = new Promise((r) => child.once("exit", r));
      child.kill("SIGTERM");
      await Promise.race([exited, new Promise((r) => setTimeout(r, 5000))]);
      if (child.exitCode === null) child.kill("SIGKILL");
    }
    await db?.end().catch(() => {});
    await admin.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`).catch(() => {});
    await admin.end();
  });

  const req = createRequire(path.join(dir, "package.json"));
  const prismaCli = req.resolve("prisma/build/index.js");
  const migrate = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], { cwd: dir, encoding: "utf8", env: { ...process.env, DATABASE_URL: databaseUrl }, timeout: 120000 });
  if (migrate.status !== 0) throw new Error(`prisma migrate deploy נכשל:\n${(migrate.stdout + migrate.stderr).slice(-1500)}`);

  const port = await freePort();
  let output = "";
  child = spawn(process.execPath, [path.join("dist", "main.js")], {
    cwd: dir,
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(port),
      DATABASE_URL: databaseUrl,
      JWT_SECRET: "checker-secret-0123456789-0123456789-abcdef",
      BCRYPT_ROUNDS: "4",
      ADMIN_EMAIL: ADMIN.email,
      ADMIN_PASSWORD: ADMIN.password,
      CORS_ORIGINS: "http://localhost:5500",
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (d) => (output = (output + d).slice(-4000)));
  child.stderr.on("data", (d) => (output = (output + d).slice(-4000)));
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; ; i++) {
    if (child.exitCode !== null) throw new Error(`השרת נעצר בעלייה (exit ${child.exitCode}):\n${output.slice(-1500)}`);
    try {
      if ((await fetch(base + "/health")).ok) break;
    } catch {
      // עוד לא מאזין
    }
    if (i > 150) throw new Error(`השרת לא ענה ל־GET /health תוך 30 שניות:\n${output.slice(-1500)}`);
    await new Promise((r) => setTimeout(r, 200));
  }
  // החשבון של המנהל נוצר בעלייה (ADMIN_EMAIL) — מחכים לו
  db = new pg.Client({ connectionString: databaseUrl });
  await db.connect();
  const call = api(base);
  const as = (token) => (method, p, body, headers = {}) => call(method, p, body, { headers: { authorization: `Bearer ${token}`, ...headers } });
  async function login(email, password) {
    for (let i = 0; i < 25; i++) {
      const r = await call("POST", "/auth/login", { email, password });
      if (r.status === 200 && r.body?.accessToken) return as(r.body.accessToken);
      if (i === 24) throw new Error(`כניסה של ${email} נכשלה: ${r.status} ${JSON.stringify(r.body)}`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  let n = 0;
  async function customer(email = `customer${++n}@example.com`) {
    const r = await call("POST", "/auth/register", { email, password: "long-password-1", name: "לקוח" });
    if (r.status !== 201) throw new Error(`הרשמה של ${email} נכשלה: ${r.status} ${JSON.stringify(r.body)}`);
    return login(email, "long-password-1");
  }
  return { base, call, as, login, customer, admin: () => login(ADMIN.email, ADMIN.password), db, dir, output: () => output };
}

let keyCounter = 0;
export const key = (prefix = "key") => ({ "Idempotency-Key": `${prefix}-${process.pid}-${++keyCounter}-${randomBytes(4).toString("hex")}` });
