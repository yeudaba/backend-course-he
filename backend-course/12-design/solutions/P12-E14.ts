// P12-E14
export class RateLimiter {
  #limit: number;
  #windowMs: number;
  #now: () => number;
  #hits = new Map<string, number[]>();

  constructor({ limit, windowMs, now = Date.now }: { limit: number; windowMs: number; now?: () => number }) {
    this.#limit = limit;
    this.#windowMs = windowMs;
    this.#now = now;
  }

  #recent(key: string): number[] {
    const cutoff = this.#now() - this.#windowMs;
    const recent = (this.#hits.get(key) ?? []).filter((t) => t > cutoff);
    this.#hits.set(key, recent);
    return recent;
  }

  allow(key: string): boolean {
    const recent = this.#recent(key);
    if (recent.length >= this.#limit) {
      return false;
    }
    recent.push(this.#now());
    return true;
  }

  remaining(key: string): number {
    return Math.max(0, this.#limit - this.#recent(key).length);
  }
}

let t = 0;
const rl = new RateLimiter({ limit: 2, windowMs: 1000, now: () => t });
console.log(rl.allow("ip1"), rl.allow("ip1"), rl.allow("ip1"));
t = 1001;
console.log(rl.allow("ip1"), rl.remaining("ip1"));
