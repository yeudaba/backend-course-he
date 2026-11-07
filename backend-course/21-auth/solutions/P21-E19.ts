// P21-E19
import { Body, Controller, HttpCode, HttpException, HttpStatus, Inject, Injectable, Module, Post, Res, UnauthorizedException } from "@nestjs/common";
import type { Response } from "express";

export const CLOCK = "CLOCK";
export interface Clock {
  now(): Date;
}

export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class LoginAttemptsService {
  // לכל אימייל: מתי היו הכישלונות האחרונים
  private readonly failures = new Map<string, number[]>();

  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  private recent(email: string) {
    const now = this.clock.now().getTime();
    const list = (this.failures.get(email) ?? []).filter((t) => now - t < WINDOW_MS);
    this.failures.set(email, list);
    return list;
  }

  // כמה שניות לחכות, או 0 אם מותר לנסות
  retryAfterSeconds(email: string): number {
    const list = this.recent(email);
    if (list.length < MAX_FAILURES) return 0;
    const unlockAt = list[list.length - MAX_FAILURES] + WINDOW_MS;
    return Math.ceil((unlockAt - this.clock.now().getTime()) / 1000);
  }

  recordFailure(email: string) {
    this.failures.set(email, [...this.recent(email), this.clock.now().getTime()]);
  }

  reset(email: string) {
    this.failures.delete(email);
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly attempts: LoginAttemptsService) {}

  @Post("login")
  @HttpCode(200)
  login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const email = String(body.email).trim().toLowerCase(); // אחרת Dana@ ו־dana@ — שני מונים
    const wait = this.attempts.retryAfterSeconds(email);
    if (wait > 0) {
      res.setHeader("Retry-After", String(wait));
      throw new HttpException("יותר מדי ניסיונות. נסה שוב מאוחר יותר", HttpStatus.TOO_MANY_REQUESTS);
    }
    // בתרגיל: סיסמה "נכונה" היא correct-password (בפרויקט — bcrypt)
    if (body.password !== "correct-password") {
      this.attempts.recordFailure(email);
      throw new UnauthorizedException("אימייל או סיסמה שגויים");
    }
    this.attempts.reset(email);
    return { ok: true };
  }
}

@Module({
  controllers: [AuthController],
  providers: [LoginAttemptsService, { provide: CLOCK, useValue: { now: () => new Date() } }],
})
export class AuthModule {}
