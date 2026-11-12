// P22-E91 — הקוד שבודקים (לא משנים אותו). AuthService קטן, בזיכרון, עם שעון מוזרק
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type User = { id: number; email: string; passwordHash: string; role: "user" | "admin" };
type RefreshRecord = { userId: number; expiresAt: number; revoked: boolean };

const SECRET = "p22-e91-secret-at-least-32-characters";
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const norm = (email: string) => email.trim().toLowerCase();
const invalidRefresh = () => new HttpError(401, "INVALID_REFRESH_TOKEN", "צריך להתחבר מחדש");

export class AuthService {
  readonly #clock: { now(): Date };
  #users: User[] = [];
  #refresh = new Map<string, RefreshRecord>();

  constructor(clock: { now(): Date }) {
    this.#clock = clock;
  }

  async register(email: string, password: string) {
    const e = norm(email);
    if (this.#users.some((u) => u.email === e)) throw new HttpError(409, "EMAIL_TAKEN", "האימייל כבר רשום");
    const user: User = { id: this.#users.length + 1, email: e, passwordHash: await bcrypt.hash(password, 4), role: "user" };
    this.#users.push(user);
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string) {
    const user = this.#users.find((u) => u.email === norm(email));
    if (!user) {
      await bcrypt.compare(password, "$2b$04$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuvwxyz12345");
      throw new HttpError(401, "INVALID_CREDENTIALS", "אימייל או סיסמה שגויים");
    }
    if (!(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(401, "INVALID_CREDENTIALS", "אימייל או סיסמה שגויים");
    return this.#issue(user);
  }

  async verifyAccessToken(token: string) {
    try {
      const p = jwt.verify(token, SECRET, { algorithms: ["HS256"], clockTimestamp: Math.floor(this.#clock.now().getTime() / 1000) }) as unknown as { sub: number; role: string };
      return { id: p.sub, role: p.role };
    } catch {
      throw new HttpError(401, "INVALID_TOKEN", "טוקן לא תקין");
    }
  }

  async refresh(refreshToken: string) {
    const record = this.#refresh.get(sha(refreshToken));
    if (!record) throw invalidRefresh();
    if (record.revoked) {
      for (const r of this.#refresh.values()) if (r.userId === record.userId) r.revoked = true;
      throw invalidRefresh();
    }
    if (record.expiresAt <= this.#clock.now().getTime()) throw invalidRefresh();
    record.revoked = true;
    const user = this.#users.find((u) => u.id === record.userId)!;
    return this.#issue(user);
  }

  #issue(user: User) {
    const now = this.#clock.now().getTime();
    const accessToken = jwt.sign({ sub: user.id, role: user.role, iat: Math.floor(now / 1000) }, SECRET, { expiresIn: 900 });
    const refreshToken = randomBytes(32).toString("base64url");
    this.#refresh.set(sha(refreshToken), { userId: user.id, expiresAt: now + REFRESH_MS, revoked: false });
    return { accessToken, refreshToken };
  }
}
