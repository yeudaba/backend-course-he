import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CLOCK, CONFIG, type AppConfig, type Clock } from "../config";
import { HttpError } from "../errors";
import { toPublicUser, USERS_REPOSITORY, type User, type UsersRepository } from "../users/users.repository";
import type { AuthUser } from "./auth.decorators";
import type { LoginInput, RegisterInput, UpdateMeInput } from "./auth.schema";
import { PasswordService } from "./password.service";
import { REFRESH_TOKENS_REPOSITORY, type RefreshTokensRepository } from "./refresh-tokens.repository";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const DAY_MS = 24 * 60 * 60 * 1000;

const invalidCredentials = () => new HttpError(401, "INVALID_CREDENTIALS", "אימייל או סיסמה שגויים");
const invalidRefresh = () => new HttpError(401, "INVALID_REFRESH_TOKEN", "צריך להתחבר מחדש");

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(REFRESH_TOKENS_REPOSITORY) private readonly refreshTokens: RefreshTokensRepository,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(CLOCK) private readonly clock: Clock,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
  ) {}

  private nowSeconds() {
    return Math.floor(this.clock.now().getTime() / 1000);
  }

  async register({ email, password, timeZone }: RegisterInput) {
    // התפקיד תמיד "user". admin נוצר רק מה־seed או ע"י admin אחר — לא מגוף הבקשה
    const user = await this.users.insert({
      email,
      passwordHash: await this.passwords.hash(password),
      role: "user",
      timeZone,
      createdAt: this.clock.now().toISOString(),
    });
    if (!user) throw new HttpError(409, "EMAIL_TAKEN", "האימייל כבר רשום");
    return toPublicUser(user);
  }

  async login({ email, password }: LoginInput): Promise<TokenPair> {
    const user = await this.users.findByEmail(email);
    // אותה תשובה ובערך אותו זמן — בין אם המשתמש לא קיים ובין אם הסיסמה שגויה
    if (!user) {
      await this.passwords.verifyAgainstDummy(password);
      throw invalidCredentials();
    }
    if (!(await this.passwords.verify(password, user.passwordHash))) throw invalidCredentials();
    return this.issueTokens(user);
  }

  // rotation: כל refresh token עובד פעם אחת, ומחזיר זוג חדש
  async refresh(refreshToken: string): Promise<TokenPair> {
    const record = await this.refreshTokens.findByHash(sha256(refreshToken));
    if (!record) throw invalidRefresh();
    const now = this.clock.now().toISOString();
    if (record.revokedAt !== null) {
      // טוקן שכבר הוחלף חוזר? מישהו גנב אותו (או את החדש). מבטלים את כל הטוקנים של המשתמש
      await this.refreshTokens.revokeAllForUser(record.userId, now);
      throw invalidRefresh();
    }
    if (record.expiresAt <= now) throw invalidRefresh();
    if (!(await this.refreshTokens.revoke(record.id, now))) throw invalidRefresh(); // בקשה מקבילה הקדימה
    const user = await this.users.findById(record.userId);
    if (!user) throw invalidRefresh();
    return this.issueTokens(user);
  }

  async logout(refreshToken: string) {
    const record = await this.refreshTokens.findByHash(sha256(refreshToken));
    if (record) await this.refreshTokens.revoke(record.id, this.clock.now().toISOString());
  }

  async me(id: number) {
    const user = await this.users.findById(id);
    if (!user) throw new HttpError(401, "INVALID_TOKEN", "המשתמש לא קיים");
    return toPublicUser(user);
  }

  async updateMe(id: number, { timeZone }: UpdateMeInput) {
    const user = await this.users.updateTimeZone(id, timeZone);
    if (!user) throw new HttpError(401, "INVALID_TOKEN", "המשתמש לא קיים");
    return toPublicUser(user);
  }

  // נקרא מה־guard בכל בקשה
  async verifyAccessToken(token: string): Promise<AuthUser> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number; role: AuthUser["role"] }>(token, {
        clockTimestamp: this.nowSeconds(),
        algorithms: ["HS256"],
      });
      return { id: payload.sub, role: payload.role };
    } catch (err) {
      const expired = err instanceof Error && err.name === "TokenExpiredError";
      throw new HttpError(401, "INVALID_TOKEN", expired ? "פג תוקף הטוקן" : "טוקן לא תקין");
    }
  }

  private async issueTokens(user: User): Promise<TokenPair> {
    const { accessTokenTtlSeconds, refreshTokenTtlDays } = this.config;
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role: user.role, iat: this.nowSeconds() },
      { expiresIn: accessTokenTtlSeconds, algorithm: "HS256" },
    );
    const refreshToken = randomBytes(32).toString("base64url"); // 256 ביט אקראיים — אי אפשר לנחש
    await this.refreshTokens.insert({
      userId: user.id,
      tokenHash: sha256(refreshToken), // במסד — רק ה־hash
      expiresAt: new Date(this.clock.now().getTime() + refreshTokenTtlDays * DAY_MS).toISOString(),
    });
    return { accessToken, refreshToken, tokenType: "Bearer", expiresIn: accessTokenTtlSeconds };
  }
}
