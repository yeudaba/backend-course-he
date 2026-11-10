// P22-E28: memoizeAsync — מטמון לפונקציה אסינכרונית, עם שעון מוזרק
export function memoizeAsync<A extends string | number, R>(
  fn: (arg: A) => Promise<R>,
  { ttlMs, now = Date.now }: { ttlMs: number; now?: () => number },
): (arg: A) => Promise<R> {
  const cache = new Map<A, { promise: Promise<R>; expiresAt: number }>();

  return (arg: A) => {
    const hit = cache.get(arg);
    if (hit && hit.expiresAt > now()) return hit.promise;

    const promise = fn(arg);
    cache.set(arg, { promise, expiresAt: now() + ttlMs });
    // שגיאה לא נשמרת: הקריאה הבאה תנסה שוב
    promise.catch(() => {
      if (cache.get(arg)?.promise === promise) cache.delete(arg);
    });
    return promise;
  };
}

let clock = 0;
let calls = 0;
const getRate = memoizeAsync(
  async (currency: string) => {
    calls++;
    return currency === "USD" ? 3.7 : 4;
  },
  { ttlMs: 60_000, now: () => clock },
);

Promise.all([getRate("USD"), getRate("USD")])
  .then(([a, b]) => {
    console.log(a, b, "קריאות:", calls);
    clock = 60_000;
    return getRate("USD");
  })
  .then(() => console.log("אחרי דקה — קריאות:", calls));
