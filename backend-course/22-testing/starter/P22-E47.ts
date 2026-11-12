// P22-E47 — הקוד שבודקים (לא משנים אותו)
type Options = { attempts?: number; delayMs?: number; sleep?: (ms: number) => Promise<void> };

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// מנסה עד attempts פעמים. בין ניסיון לניסיון: delayMs, ואז פי 2 בכל פעם. נכשלו כולם ← השגיאה האחרונה
export async function retry<T>(fn: () => Promise<T>, { attempts = 3, delayMs = 100, sleep = realSleep }: Options = {}): Promise<T> {
  if (!Number.isInteger(attempts) || attempts < 1) throw new RangeError("attempts חייב להיות מספר שלם חיובי");
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts) await sleep(delayMs * 2 ** (i - 1));
    }
  }
  throw lastError;
}
