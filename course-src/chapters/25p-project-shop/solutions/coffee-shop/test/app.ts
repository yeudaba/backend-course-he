import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/app.setup";
import { CONFIG, type AppConfig } from "../src/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaService } from "../src/prisma/prisma.service";

// מסד בדיקות: schema חדש לכל קובץ בדיקה, עם כל ה־migrations, ונמחק בסוף. DATABASE_URL_TEST — לא המסד של הפיתוח
export async function createTestApp() {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) throw new Error("חסר DATABASE_URL_TEST (מסד נפרד לבדיקות)");
  const schema = `e2e_${randomBytes(4).toString("hex")}`;
  const admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA "${schema}"; SET search_path TO "${schema}"`);
  const dir = path.join(__dirname, "..", "prisma", "migrations");
  for (const m of fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, "migration.sql"))).sort()) {
    await admin.query(fs.readFileSync(path.join(dir, m, "migration.sql"), "utf8"));
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, options: `-c timezone=UTC -c search_path=${schema}` }, { schema }) });
  const config: AppConfig = { jwtSecret: "e2e-secret-0123456789-0123456789-abcdef", accessTokenTtlSeconds: 3600, bcryptRounds: 4, idempotencyTtlHours: 24, admin: { email: "admin@shop.test", password: "admin-password-123" } };
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService).useValue(prisma)
    .overrideProvider(CONFIG).useValue(config)
    .compile();
  const app: INestApplication = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  const http = () => request(app.getHttpServer());

  let n = 0;
  async function login(email: string, password: string) {
    const res = await http().post("/auth/login").send({ email, password }).expect(200);
    return { Authorization: `Bearer ${res.body.accessToken as string}` };
  }
  async function customer() {
    const email = `c${++n}@example.com`;
    await http().post("/auth/register").send({ email, password: "long-password-1", name: "לקוח" }).expect(201);
    return login(email, "long-password-1");
  }
  return {
    app,
    http,
    prisma,
    customer,
    admin: () => login("admin@shop.test", "admin-password-123"),
    async close() {
      await app.close();
      await prisma.$disconnect();
      await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
      await admin.end();
    },
  };
}
