// P22-E89: TestClock — שעון שהבדיקה שולטת בו
const UNIT = { d: 86_400_000, h: 3_600_000, m: 60_000, s: 1_000 } as const;

function parseIso(iso: string): number {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) throw new RangeError(`תאריך לא תקין: ${iso}`);
  return ms;
}

export class TestClock {
  #ms: number;

  constructor(iso = "2026-11-04T10:00:00.000Z") {
    this.#ms = parseIso(iso);
  }

  now(): Date {
    return new Date(this.#ms);
  }

  set(iso: string): void {
    this.#ms = parseIso(iso);
  }

  advance(duration: number | string): void {
    if (typeof duration === "number") {
      this.#ms += duration;
      return;
    }
    if (!/^(\d+[dhms])+$/.test(duration)) throw new RangeError(`משך לא תקין: ${duration}`);
    for (const [, n, unit] of duration.matchAll(/(\d+)([dhms])/g)) {
      this.#ms += Number(n) * UNIT[unit as keyof typeof UNIT];
    }
  }
}
