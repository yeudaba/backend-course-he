// P21-E18
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
  private dummyHash?: Promise<string>;

  constructor(@Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher) {}

  async addUser(email: string, password: string) {
    this.users.push({ id: this.users.length + 1, email, passwordHash: await this.hasher.hash(password) });
  }

  async login(email: string, password: string): Promise<{ userId: number }> {
    const user = this.users.find((u) => u.email === email);
    // compare רץ בדיוק פעם אחת בכל מקרה — גם כשאין משתמש
    this.dummyHash ??= this.hasher.hash("dummy-password-nobody-knows");
    const ok = await this.hasher.compare(password, user ? user.passwordHash : await this.dummyHash);
    if (!user || !ok) throw new UnauthorizedException("אימייל או סיסמה שגויים");
    return { userId: user.id };
  }
}

// השוואה בזמן קבוע: === עוצר בתו הראשון שונה, ולכן "מדליף" כמה תווים נכונים
export function safeEqual(a: string, b: string): boolean {
  // hash קודם — כך שני הצדדים באותו אורך, ו־timingSafeEqual לא זורק
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
