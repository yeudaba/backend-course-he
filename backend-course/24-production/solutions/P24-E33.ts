// P24-E33 — התראה על שיעור שגיאות בחלון זמן
type Options = { windowMs: number; threshold: number; minRequests: number };

export class ErrorRateAlarm {
  #events: { at: number; error: boolean }[] = [];
  #options: Options;
  #now: () => number;

  constructor(options: Options, now: () => number = () => Date.now()) {
    if (!(options.threshold > 0 && options.threshold <= 1)) throw new RangeError("threshold חייב להיות בין 0 ל־1");
    this.#options = options;
    this.#now = now;
  }

  #prune(): void {
    const from = this.#now() - this.#options.windowMs;
    while (this.#events.length > 0 && this.#events[0].at <= from) this.#events.shift();
  }

  record(status: number): void {
    this.#events.push({ at: this.#now(), error: status >= 500 });
  }

  get count(): number {
    this.#prune();
    return this.#events.length;
  }

  get errorRate(): number {
    this.#prune();
    if (this.#events.length === 0) return 0;
    const errors = this.#events.filter((e) => e.error).length;
    return errors / this.#events.length;
  }

  shouldAlert(): boolean {
    return this.count >= this.#options.minRequests && this.errorRate >= this.#options.threshold;
  }
}

let now = 0;
const alarm = new ErrorRateAlarm({ windowMs: 60_000, threshold: 0.1, minRequests: 20 }, () => now);
for (let i = 0; i < 18; i++) alarm.record(200);
alarm.record(500);
alarm.record(503);
console.log(alarm.count, alarm.errorRate, alarm.shouldAlert());
now = 30_000;
alarm.record(200);
console.log(alarm.count, alarm.errorRate.toFixed(3), alarm.shouldAlert());
now = 60_000;
console.log(alarm.count, alarm.errorRate, alarm.shouldAlert());
