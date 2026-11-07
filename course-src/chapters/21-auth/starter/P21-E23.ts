// P21-E23: שלוש תקלות — הטוקן נשמר כמו שהוא, הישן עובד שוב, והתוקף קצר מדי
import { randomBytes } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

const DAY_MS = 24 * 60 * 60;

@Injectable()
export class RefreshTokenService {
  private readonly records = new Map<string, { userId: number; expiresAt: number; used: boolean }>();

  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  issue(userId: number): string {
    const token = randomBytes(32).toString("base64url");
    this.records.set(token, { userId, expiresAt: this.clock.now().getTime() + 7 * DAY_MS, used: false });
    return token;
  }

  rotate(token: string) {
    const record = this.records.get(token);
    if (!record || record.used || record.expiresAt <= this.clock.now().getTime()) throw new UnauthorizedException("צריך להתחבר מחדש");
    return { userId: record.userId, refreshToken: this.issue(record.userId) };
  }

  storedKeys(): string[] {
    return [...this.records.keys()];
  }
}
