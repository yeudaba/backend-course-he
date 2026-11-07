// P21-E17: יציאה, והחלפת סיסמה שמנתקת את כל המכשירים
import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import bcrypt from "bcryptjs";

export const BCRYPT_ROUNDS = "BCRYPT_ROUNDS";
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

interface User {
  id: number;
  email: string;
  passwordHash: string;
}

@Injectable()
export class AccountService {
  private readonly users: User[] = [];
  private readonly refreshTokens = new Map<string, { userId: number; revoked: boolean }>();

  constructor(@Inject(BCRYPT_ROUNDS) private readonly rounds: number) {}

  async createUser(email: string, password: string) {
    const user = { id: this.users.length + 1, email, passwordHash: await bcrypt.hash(password, this.rounds) };
    this.users.push(user);
    return user.id;
  }

  async login(email: string, password: string): Promise<string> {
    const user = this.users.find((u) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException("אימייל או סיסמה שגויים");
    const token = randomBytes(32).toString("base64url");
    this.refreshTokens.set(sha256(token), { userId: user.id, revoked: false });
    return token;
  }

  isActive(token: string): boolean {
    const record = this.refreshTokens.get(sha256(token));
    return record !== undefined && !record.revoked;
  }

  logout(token: string): void {
    // כתוב כאן
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    // כתוב כאן
  }
}
