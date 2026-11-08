// P28-E23
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
      // תקלה 2: הבדיקה הייתה רק אחרי שהקריאה נכשלה ← כשהמעגל פתוח, כל בקשה עדיין פנתה לשירות המת (וחיכתה ל־timeout שלו)
      if (s === "open") throw new Error("circuit open");
      try {
        const result = await call();
        failures = 0; // תקלה 1: הצלחה לא איפסה את המונה ← 3 כישלונות "מפוזרים" לאורך יום פותחים את המעגל
        state = "closed";
        return result;
      } catch (err) {
        failures++;
        // תקלה 3: התנאי היה רק s === "closed" ← כישלון של בקשת הניסיון ב־half-open השאיר אותו half-open, וכל הבקשות עברו לשירות
        if (s === "half-open" || failures >= failureThreshold) {
          state = "open";
          openedAt = now();
        }
        throw err;
      }
    },
  };
}
