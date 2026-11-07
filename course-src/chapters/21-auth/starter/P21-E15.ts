// P21-E15: refresh tokens אטומים — issue, rotate (פעם אחת), 7 ימים, ובאחסון רק hash
import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class RefreshTokenService {
  private readonly records = new Map<string, { userId: number; expiresAt: number; usedAt: number | null }>();

  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  issue(userId: number): string {
    return ""; // כתוב כאן
  }

  rotate(token: string): { userId: number; refreshToken: string } {
    throw new UnauthorizedException("צריך להתחבר מחדש"); // כתוב כאן
  }

  storedKeys(): string[] {
    return [...this.records.keys()];
  }
}
