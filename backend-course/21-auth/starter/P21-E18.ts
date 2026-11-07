// P21-E18: כניסה שלא מגלה מי רשום (גם לא בזמן), ו־safeEqual
import { createHash, timingSafeEqual } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";

export const PASSWORD_HASHER = "PASSWORD_HASHER";
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

interface User {
  id: number;
  email: string;
  passwordHash: string;
}

@Injectable()
export class LoginService {
  private readonly users: User[] = [];

  constructor(@Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher) {}

  async addUser(email: string, password: string) {
    this.users.push({ id: this.users.length + 1, email, passwordHash: await this.hasher.hash(password) });
  }

  async login(email: string, password: string): Promise<{ userId: number }> {
    const user = this.users.find((u) => u.email === email);
    if (!user) throw new UnauthorizedException("משתמש לא קיים");
    if (!(await this.hasher.compare(password, user.passwordHash))) throw new UnauthorizedException("סיסמה שגויה");
    return { userId: user.id };
  }
}

export function safeEqual(a: string, b: string): boolean {
  return a === b; // תקן
}
