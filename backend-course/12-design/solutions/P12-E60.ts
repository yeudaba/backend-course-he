// P12-E60: שעון מוזרק
export interface Clock {
  now(): number;
}

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
}

export class FakeClock implements Clock {
  #t: number;
  constructor(start = 0) {
    this.#t = start;
  }
  now(): number {
    return this.#t;
  }
  advance(ms: number): void {
    if (ms < 0) throw new RangeError("אי אפשר לחזור בזמן");
    this.#t += ms;
  }
}

export function isExpired(expiresAt: number, clock: Clock): boolean {
  return clock.now() >= expiresAt;
}

const clock = new FakeClock(1000);
console.log(isExpired(5000, clock));
clock.advance(4000);
console.log(isExpired(5000, clock), isExpired(Date.now() + 60_000, new SystemClock()));
