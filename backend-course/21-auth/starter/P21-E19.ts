// P21-E19: נעילה אחרי 5 כניסות כושלות ב־15 דקות ← 429 + Retry-After
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
  constructor(@Inject(CLOCK) private readonly clock: Clock) {}

  retryAfterSeconds(email: string): number {
    return 0; // כתוב כאן
  }

  recordFailure(email: string) {
    // כתוב כאן
  }

  reset(email: string) {
    // כתוב כאן
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly attempts: LoginAttemptsService) {}

  @Post("login")
  @HttpCode(200)
  login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    // בתרגיל: סיסמה "נכונה" היא correct-password
    if (body.password !== "correct-password") throw new UnauthorizedException("אימייל או סיסמה שגויים");
    return { ok: true };
  }
}

@Module({
  controllers: [AuthController],
  providers: [LoginAttemptsService, { provide: CLOCK, useValue: { now: () => new Date() } }],
})
export class AuthModule {}
