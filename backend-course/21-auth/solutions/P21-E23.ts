// P21-E23: מתוקן
import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

const DAY_MS = 24 * 60 * 60 * 1000; // ← תקלה 3: היה 24 * 60 * 60 — שניות, לא מילישניות
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

@Injectable()
export class RefreshTokenService {
  // ← תקלה 1: היה Map לפי הטוקן עצמו. מי שקורא את האחסון — מקבל טוקנים עובדים
  private readonly records = new Map<string, { userId: number; expiresAt: number; used: boolean }>();

  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  issue(userId: number): string {
    const token = randomBytes(32).toString("base64url");
    this.records.set(sha256(token), { userId, expiresAt: this.clock.now().getTime() + 7 * DAY_MS, used: false });
    return token;
  }

  rotate(token: string) {
    const record = this.records.get(sha256(token));
    if (!record || record.used || record.expiresAt <= this.clock.now().getTime()) throw new UnauthorizedException("צריך להתחבר מחדש");
    record.used = true; // ← תקלה 2: הישן לא סומן — עבד שוב ושוב
    return { userId: record.userId, refreshToken: this.issue(record.userId) };
  }

  storedKeys(): string[] {
    return [...this.records.keys()];
  }
}
