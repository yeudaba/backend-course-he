// P24-E100: guard של הגבלת קצב ב־Nest
import { HttpException, type CanActivate, type ExecutionContext } from "@nestjs/common";

const WINDOW_MS = 60_000;

export class LoginRateLimitGuard implements CanActivate {
  #hits = new Map<string, number[]>();
  #limit: number;
  #clock: { now(): Date };

  constructor(limitPerMinute: number, clock: { now(): Date }) {
    this.#limit = limitPerMinute;
    this.#clock = clock;
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ ip?: string }>();
    const res = context.switchToHttp().getResponse<{ setHeader(name: string, value: string): void }>();
    const now = this.#clock.now().getTime();
    const key = String(req.ip);
    const recent = (this.#hits.get(key) ?? []).filter((t) => t > now - WINDOW_MS);
    const blocked = recent.length >= this.#limit;
    if (!blocked) recent.push(now); // בקשה חסומה לא נספרת
    this.#hits.set(key, recent);
    const reset = String(Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
    res.setHeader("RateLimit-Limit", String(this.#limit));
    res.setHeader("RateLimit-Remaining", String(this.#limit - recent.length));
    res.setHeader("RateLimit-Reset", reset);
    if (blocked) {
      res.setHeader("Retry-After", reset);
      throw new HttpException({ error: { code: "TOO_MANY_REQUESTS", message: `יותר מדי ניסיונות. נסה שוב בעוד ${reset} שניות` } }, 429);
    }
    return true;
  }
}
