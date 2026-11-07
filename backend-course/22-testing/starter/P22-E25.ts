// P22-E25 — הקוד שבודקים (לא משנים אותו)
// "חלון נע": לכל מפתח — לא יותר מ־limit בקשות ב־windowMs האחרונים
export interface Clock {
  now(): number; // מילישניות
}

export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly clock: Clock;

  constructor(limit: number, windowMs: number, clock: Clock) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.clock = clock;
  }

  // { allowed, remaining, retryAfterMs }. בקשה שנדחתה — לא נספרת
  hit(key: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = this.clock.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => t > now - this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return { allowed: false, remaining: 0, retryAfterMs: recent[0] + this.windowMs - now };
    }
    recent.push(now);
    this.hits.set(key, recent);
    return { allowed: true, remaining: this.limit - recent.length, retryAfterMs: 0 };
  }
}
