// P12-E53: לנסות שוב — רק כשכדאי
export class TemporaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export async function retryTemporary<T>(fn: (attempt: number) => Promise<T>, attempts: number): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn(i);
    } catch (err) {
      if (!(err instanceof TemporaryError) || i >= attempts) throw err;
    }
  }
}

async function demo() {
  const flaky = async (n: number) => {
    if (n < 3) throw new TemporaryError(`ניסיון ${n}: השרת עמוס`);
    return `הצליח בניסיון ${n}`;
  };
  console.log(await retryTemporary(flaky, 5));
  let calls = 0;
  try {
    await retryTemporary(async () => {
      calls++;
      throw new Error("סיסמה שגויה");
    }, 5);
  } catch (err) {
    console.log((err as Error).message, "קריאות:", calls);
  }
}
demo();
