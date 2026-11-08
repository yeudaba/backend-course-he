// P28-E15
// circuit breaker: שירות שנופל שוב ושוב — מפסיקים לקרוא לו לזמן מה (נכשלים מיד), ואז מנסים בזהירות
export type BreakerState = "closed" | "open" | "half-open";

export function createBreaker<T>(call: () => Promise<T>, { failureThreshold = 5, openMs = 30_000, now = () => Date.now() } = {}) {
  let state: BreakerState = "closed";
  let failures = 0;
  let openedAt = 0;
  let trialRunning = false;

  return {
    get state(): BreakerState {
      if (state === "open" && now() - openedAt >= openMs) state = "half-open";
      return state;
    },
    async exec(): Promise<T> {
      const s = this.state;
      if (s === "open" || (s === "half-open" && trialRunning)) throw new Error("circuit open");
      if (s === "half-open") trialRunning = true; // רק בקשת ניסיון אחת עוברת
      try {
        const result = await call();
        state = "closed";
        failures = 0;
        return result;
      } catch (err) {
        failures++;
        if (s === "half-open" || failures >= failureThreshold) {
          state = "open";
          openedAt = now();
        }
        throw err;
      } finally {
        if (s === "half-open") trialRunning = false;
      }
    },
  };
}
