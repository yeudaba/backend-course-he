// P21-E16
import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

interface Record {
  userId: number;
  familyId: string; // כל הטוקנים שנולדו מאותה כניסה (אותו מכשיר)
  expiresAt: number;
  revoked: boolean;
}

@Injectable()
export class RefreshTokenService {
  private readonly records = new Map<string, Record>();

  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  private store(userId: number, familyId: string) {
    const token = randomBytes(32).toString("base64url");
    this.records.set(sha256(token), { userId, familyId, expiresAt: this.clock.now().getTime() + TTL_MS, revoked: false });
    return token;
  }

  // כניסה חדשה = משפחה חדשה
  login(userId: number): string {
    return this.store(userId, randomBytes(8).toString("hex"));
  }

  rotate(token: string): { userId: number; refreshToken: string } {
    const record = this.records.get(sha256(token));
    if (!record) throw new UnauthorizedException("צריך להתחבר מחדש");
    if (record.revoked) {
      // שימוש חוזר: מישהו מחזיק עותק. מבטלים את כל המשפחה — רק המכשיר הזה, לא את כל המכשירים
      for (const r of this.records.values()) if (r.familyId === record.familyId) r.revoked = true;
      throw new UnauthorizedException("צריך להתחבר מחדש");
    }
    if (record.expiresAt <= this.clock.now().getTime()) throw new UnauthorizedException("צריך להתחבר מחדש");
    record.revoked = true;
    return { userId: record.userId, refreshToken: this.store(record.userId, record.familyId) };
  }

  activeCount(userId: number): number {
    return [...this.records.values()].filter((r) => r.userId === userId && !r.revoked).length;
  }
}
