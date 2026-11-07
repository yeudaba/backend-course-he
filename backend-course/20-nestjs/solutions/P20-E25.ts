// P20-E25
import {
  CanActivate, Controller, ExecutionContext, Get, HttpException, HttpStatus, Inject, Injectable, Module, UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";

export const CLOCK = "CLOCK";
export const RATE_LIMIT = "RATE_LIMIT";
export interface Clock {
  now(): Date;
}
export interface RateLimitOptions {
  limit: number; // כמה בקשות מותר בחלון
  windowMs: number; // אורך החלון
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  // לכל לקוח: מתי התחיל החלון שלו, וכמה בקשות היו בו
  private readonly windows = new Map<string, { start: number; count: number }>();

  constructor(
    @Inject(RATE_LIMIT) private readonly options: RateLimitOptions,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const key = req.get("x-client-id") ?? req.ip ?? "unknown";
    const now = this.clock.now().getTime();

    let w = this.windows.get(key);
    if (!w || now >= w.start + this.options.windowMs) {
      w = { start: now, count: 0 };
      this.windows.set(key, w);
    }
    if (w.count >= this.options.limit) {
      const seconds = Math.ceil((w.start + this.options.windowMs - now) / 1000);
      res.setHeader("Retry-After", String(seconds)); // לפני ה־throw: ה־header נשאר על ה־response
      throw new HttpException({ error: { code: "RATE_LIMITED", message: "יותר מדי בקשות — נסה שוב מאוחר יותר" } }, HttpStatus.TOO_MANY_REQUESTS);
    }
    w.count++;
    res.setHeader("X-RateLimit-Remaining", String(this.options.limit - w.count));
    return true;
  }
}

@Controller("data")
@UseGuards(RateLimitGuard)
export class DataController {
  @Get()
  get() {
    return { data: [1, 2, 3] };
  }
}

@Module({
  controllers: [DataController],
  providers: [
    RateLimitGuard,
    { provide: RATE_LIMIT, useValue: { limit: 5, windowMs: 60_000 } },
    { provide: CLOCK, useValue: { now: () => new Date() } },
  ],
})
export class DataModule {}
