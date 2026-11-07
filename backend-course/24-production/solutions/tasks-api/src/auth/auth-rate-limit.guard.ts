import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import type { Request, Response } from "express";
import { CLOCK, CONFIG, type AppConfig, type Clock } from "../config";
import { HttpError } from "../errors";

const WINDOW_MS = 60_000;

// הגבלת קצב על כניסה והרשמה: לכל IP — עד N בקשות בדקה האחרונה ("חלון נע").
// בזיכרון: מספיק לשרת אחד. בכמה שרתים — המונים צריכים להיות משותפים (Redis, פרק 26).
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, number[]>();

  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const limit = this.config.authRateLimitPerMinute;
    const now = this.clock.now().getTime();
    // req.ip: מאחורי proxy — רק עם "trust proxy" (app.setup.ts). אחרת כולם "באים" מה־proxy
    const key = `${req.ip}`;
    const recent = (this.hits.get(key) ?? []).filter((t) => t > now - WINDOW_MS);

    if (recent.length >= limit) {
      this.hits.set(key, recent);
      const retryAfter = Math.ceil((recent[0] + WINDOW_MS - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.setHeader("RateLimit-Limit", String(limit));
      res.setHeader("RateLimit-Remaining", "0");
      res.setHeader("RateLimit-Reset", String(retryAfter));
      throw new HttpError(429, "TOO_MANY_REQUESTS", `יותר מדי ניסיונות. נסה שוב בעוד ${retryAfter} שניות`);
    }
    recent.push(now);
    this.hits.set(key, recent);
    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Remaining", String(limit - recent.length));
    res.setHeader("RateLimit-Reset", String(Math.ceil((recent[0] + WINDOW_MS - now) / 1000)));
    return true;
  }
}
