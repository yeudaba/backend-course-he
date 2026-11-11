// P28-E28 — hedged request: בקשה שנייה אם הראשונה מתעכבת
export function hedged<T>(fn: (attempt: number) => Promise<T>, delayMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    let failures = 0;
    let started = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const start = () => {
      started++;
      fn(started).then(
        (value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(value);
        },
        (err) => {
          if (settled) return;
          failures++;
          if (started === 1) {
            clearTimeout(timer);
            start(); // הראשונה נכשלה לפני שהשנייה התחילה — מתחילים אותה מיד
          } else if (failures === 2) {
            settled = true;
            reject(err);
          }
        },
      );
    };

    start();
    timer = setTimeout(() => {
      if (!settled && started === 1) start();
    }, delayMs);
  });
}

async function demo() {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const t0 = Date.now();
  const slowFirst = await hedged(async (attempt) => {
    await sleep(attempt === 1 ? 300 : 40);
    return `תשובה מניסיון ${attempt}`;
  }, 50);
  console.log(slowFirst, "· לפני שהראשונה סיימה?", Date.now() - t0 < 300);
  const fastFirst = await hedged(async (attempt) => `תשובה מניסיון ${attempt}`, 50);
  console.log(fastFirst);
  try {
    await hedged(async (attempt) => {
      throw new Error(`נכשל ${attempt}`);
    }, 50);
  } catch (err) {
    console.log((err as Error).message);
  }
}
demo();
