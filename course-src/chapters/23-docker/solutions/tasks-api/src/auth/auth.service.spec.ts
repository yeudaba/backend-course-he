import { JwtService } from "@nestjs/jwt";
import { TestClock } from "../../test/clock";
import type { AppConfig } from "../config";
import { InMemoryUsersRepository } from "../users/users.repository";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";
import { InMemoryRefreshTokensRepository } from "./refresh-tokens.repository";

const CONFIG: AppConfig = { jwtSecret: "unit-secret-0123456789-0123456789-abc", accessTokenTtlSeconds: 900, refreshTokenTtlDays: 7, bcryptRounds: 4 };

describe("AuthService", () => {
  let clock: TestClock;
  let users: InMemoryUsersRepository;
  let refreshTokens: InMemoryRefreshTokensRepository;
  let auth: AuthService;
  const credentials = { email: "dana@example.com", password: "long-password-1" };

  beforeEach(() => {
    clock = new TestClock();
    users = new InMemoryUsersRepository();
    refreshTokens = new InMemoryRefreshTokensRepository();
    auth = new AuthService(users, refreshTokens, CONFIG, clock, new PasswordService(CONFIG), new JwtService({ secret: CONFIG.jwtSecret }));
  });

  describe("register", () => {
    it("שומר hash ולא מחזיר אותו", async () => {
      const user = await auth.register(credentials);
      expect(user).toEqual({ id: 1, email: "dana@example.com", role: "user", createdAt: "2026-11-04T10:00:00.000Z" });
      expect(user).not.toHaveProperty("passwordHash");
      const stored = await users.findByEmail("dana@example.com");
      expect(stored?.passwordHash).toMatch(/^\$2[aby]\$04\$/);
      expect(stored?.passwordHash).not.toContain("long-password-1");
    });

    it("אימייל קיים — 409", async () => {
      await auth.register(credentials);
      await expect(auth.register({ ...credentials, password: "other-password" })).rejects.toMatchObject({ status: 409, code: "EMAIL_TAKEN" });
    });
  });

  describe("login", () => {
    beforeEach(() => auth.register(credentials));

    it("מחזיר access token עם sub, role ותוקף של 15 דקות", async () => {
      const tokens = await auth.login(credentials);
      const payload = new JwtService({}).decode(tokens.accessToken) as { sub: number; role: string; iat: number; exp: number };
      expect(payload).toMatchObject({ sub: 1, role: "user" });
      expect(payload.exp - payload.iat).toBe(900);
      expect(tokens.refreshToken).toHaveLength(43);
    });

    it("אימייל לא קיים וסיסמה שגויה — אותה שגיאה", async () => {
      const wrong = await auth.login({ ...credentials, password: "nope" }).catch((e) => e);
      const unknown = await auth.login({ email: "ghost@example.com", password: "nope" }).catch((e) => e);
      expect(wrong).toMatchObject({ status: 401, code: "INVALID_CREDENTIALS" });
      expect(unknown).toMatchObject({ status: 401, code: wrong.code, message: wrong.message });
    });
  });

  describe("verifyAccessToken", () => {
    it("תקף עד 15 דקות, ואז 'פג תוקף'", async () => {
      await auth.register(credentials);
      const { accessToken } = await auth.login(credentials);
      clock.set("2026-11-04T10:14:59.000Z");
      await expect(auth.verifyAccessToken(accessToken)).resolves.toEqual({ id: 1, role: "user" });
      clock.set("2026-11-04T10:15:00.000Z");
      await expect(auth.verifyAccessToken(accessToken)).rejects.toMatchObject({ status: 401, code: "INVALID_TOKEN", message: "פג תוקף הטוקן" });
    });

    it("טוקן שנחתם בסוד אחר — לא תקין", async () => {
      const forged = await new JwtService({ secret: "attacker-secret-attacker-secret-1234" }).signAsync({ sub: 1, role: "admin" });
      await expect(auth.verifyAccessToken(forged)).rejects.toMatchObject({ status: 401, message: "טוקן לא תקין" });
    });
  });

  describe("refresh", () => {
    beforeEach(() => auth.register(credentials));

    it("rotation: טוקן חדש, והישן כבר לא עובד", async () => {
      const first = await auth.login(credentials);
      const second = await auth.refresh(first.refreshToken);
      expect(second.refreshToken).not.toBe(first.refreshToken);
      await expect(auth.refresh(first.refreshToken)).rejects.toMatchObject({ status: 401, code: "INVALID_REFRESH_TOKEN" });
    });

    it("שימוש חוזר מבטל את כל הטוקנים של המשתמש", async () => {
      const first = await auth.login(credentials);
      const second = await auth.refresh(first.refreshToken);
      await expect(auth.refresh(first.refreshToken)).rejects.toThrow();
      await expect(auth.refresh(second.refreshToken)).rejects.toMatchObject({ status: 401 });
    });

    it("פג אחרי 7 ימים", async () => {
      const { refreshToken } = await auth.login(credentials);
      clock.set("2026-11-11T10:00:00.000Z");
      await expect(auth.refresh(refreshToken)).rejects.toMatchObject({ status: 401 });
    });

    it("logout מבטל את הטוקן", async () => {
      const { refreshToken } = await auth.login(credentials);
      await auth.logout(refreshToken);
      await expect(auth.refresh(refreshToken)).rejects.toMatchObject({ status: 401 });
    });
  });
});
