import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/app.setup";
import { REFRESH_TOKENS_REPOSITORY, InMemoryRefreshTokensRepository } from "../src/auth/refresh-tokens.repository";
import { CLOCK, CONFIG, type AppConfig } from "../src/config";
import { PrismaService } from "../src/prisma/prisma.service";
import { InMemoryTasksRepository } from "../src/tasks/tasks.repository";
import { TASKS_REPOSITORY } from "../src/tasks/tasks.tokens";
import { InMemoryUsersRepository, USERS_REPOSITORY } from "../src/users/users.repository";
import { TestClock } from "./clock";

export { TestClock };

export const TEST_CONFIG: AppConfig = {
  jwtSecret: "test-secret-0123456789-0123456789-abcdef",
  accessTokenTtlSeconds: 900,
  refreshTokenTtlDays: 7,
  bcryptRounds: 4, // מהיר — בבדיקות לא צריך bcrypt איטי
};

// אפליקציה שלמה (אותו AppModule ואותו configureApp כמו ב־main.ts), עם repositories בזיכרון
export async function createTestApp() {
  const clock = new TestClock();
  const users = new InMemoryUsersRepository();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(TASKS_REPOSITORY).useValue(new InMemoryTasksRepository())
    .overrideProvider(USERS_REPOSITORY).useValue(users)
    .overrideProvider(REFRESH_TOKENS_REPOSITORY).useValue(new InMemoryRefreshTokensRepository())
    .overrideProvider(CLOCK).useValue(clock)
    .overrideProvider(CONFIG).useValue(TEST_CONFIG)
    .overrideProvider(PrismaService).useValue({ $disconnect: async () => {} })
    .compile();
  const app: INestApplication = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  return { app, clock, users, http: () => request(app.getHttpServer()) };
}

// נרשם ומתחבר; מחזיר את הטוקנים
export async function signUp(app: INestApplication, email: string, password = "long-password-1") {
  await request(app.getHttpServer()).post("/auth/register").send({ email, password }).expect(201);
  const res = await request(app.getHttpServer()).post("/auth/login").send({ email, password }).expect(200);
  return res.body as { accessToken: string; refreshToken: string };
}
