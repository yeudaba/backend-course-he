// P21-E16: rotation עם "משפחות" — שימוש חוזר מבטל רק את המכשיר שנפגע
import { createHash, randomBytes } from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

@Injectable()
export class RefreshTokenService {
  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  login(userId: number): string {
    return ""; // כתוב כאן
  }

  rotate(token: string): { userId: number; refreshToken: string } {
    throw new UnauthorizedException("צריך להתחבר מחדש"); // כתוב כאן
  }

  activeCount(userId: number): number {
    return 0; // כתוב כאן
  }
}
