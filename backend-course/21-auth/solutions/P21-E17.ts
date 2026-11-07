// P21-E17
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
    const record = this.refreshTokens.get(sha256(token));
    if (record) record.revoked = true; // טוקן לא מוכר — פשוט לא עושים כלום
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new NotFoundException("משתמש לא נמצא");
    // מי שמחזיק טוקן גנוב לא יכול להחליף סיסמה בלי לדעת את הישנה
    if (!(await bcrypt.compare(oldPassword, user.passwordHash))) throw new UnauthorizedException("הסיסמה הנוכחית שגויה");
    if (newPassword.length < 8) throw new BadRequestException("לפחות 8 תווים");
    if (newPassword === oldPassword) throw new BadRequestException("הסיסמה החדשה זהה לישנה");
    user.passwordHash = await bcrypt.hash(newPassword, this.rounds);
    // "צא מכל המכשירים": אם הסיסמה דלפה, גם הטוקנים שנוצרו איתה לא בטוחים
    for (const record of this.refreshTokens.values()) if (record.userId === userId) record.revoked = true;
  }
}
