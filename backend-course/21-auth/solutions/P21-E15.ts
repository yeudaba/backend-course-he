// P21-E15
import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

interface Record {
  userId: number;
  expiresAt: number;
  usedAt: number | null;
}

@Injectable()
export class RefreshTokenService {
  // המפתח הוא ה־hash של הטוקן — הטוקן עצמו לא נשמר בשום מקום
  private readonly records = new Map<string, Record>();

  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  issue(userId: number): string {
    const token = randomBytes(32).toString("base64url");
    this.records.set(sha256(token), { userId, expiresAt: this.clock.now().getTime() + REFRESH_TTL_MS, usedAt: null });
    return token;
  }

  rotate(token: string): { userId: number; refreshToken: string } {
    const record = this.records.get(sha256(token));
    const now = this.clock.now().getTime();
    if (!record || record.usedAt !== null || record.expiresAt <= now) throw new UnauthorizedException("צריך להתחבר מחדש");
    record.usedAt = now; // פעם אחת בלבד
    return { userId: record.userId, refreshToken: this.issue(record.userId) };
  }

  storedKeys(): string[] {
    return [...this.records.keys()];
  }
}
