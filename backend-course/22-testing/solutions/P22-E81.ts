// P22-E81 — הקוד שבודקים (לא משנים אותו)
// 5 כישלונות בתוך 15 דקות ← נעול עד 15 דקות אחרי הראשון מבין החמישה
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export class LoginLimiter {
  readonly #now: () => number;
  #failures = new Map<string, number[]>();

  constructor(now: () => number = Date.now) {
    this.#now = now;
  }

  #key(email: string) {
    return email.trim().toLowerCase();
  }

  // רק הכישלונות מ־15 הדקות האחרונות
  #recent(email: string): number[] {
    const now = this.#now();
    const list = (this.#failures.get(this.#key(email)) ?? []).filter((t) => now - t < WINDOW_MS);
    this.#failures.set(this.#key(email), list);
    return list;
  }

  recordFailure(email: string): void {
    this.#recent(email).push(this.#now());
  }

  reset(email: string): void {
    this.#failures.delete(this.#key(email));
  }

  retryAfterSeconds(email: string): number {
    const list = this.#recent(email);
    if (list.length < MAX_FAILURES) return 0;
    const first = list[list.length - MAX_FAILURES];
    return Math.ceil((first + WINDOW_MS - this.#now()) / 1000);
  }
}
