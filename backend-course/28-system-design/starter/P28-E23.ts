// P28-E23: "המעגל נפתח בגלל 3 תקלות לאורך יום שלם, כשהוא פתוח עדיין פונים לשירות המת, ואחרי ניסיון שנכשל הוא לא נסגר שוב" — שלוש תקלות
export function createBreaker<T>(call: () => Promise<T>, { failureThreshold = 3, openMs = 10_000, now = () => Date.now() } = {}) {
  let state: "closed" | "open" | "half-open" = "closed";
  let failures = 0;
  let openedAt = 0;
  return {
    get state() {
      if (state === "open" && now() - openedAt >= openMs) state = "half-open";
      return state;
    },
    async exec(): Promise<T> {
      const s = this.state;
      try {
        const result = await call();
        state = "closed";
        return result;
      } catch (err) {
        failures++;
        if (failures >= failureThreshold && s === "closed") {
          state = "open";
          openedAt = now();
        }
        if (s === "open") throw new Error("circuit open");
        throw err;
      }
    },
  };
}
