// P22-E63: waitFor — מנסים שוב עד שהתנאי מתקיים, או עד timeout
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function waitFor<T>(
  check: () => T | Promise<T>,
  { timeoutMs = 1000, intervalMs = 20 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<T> {
  const start = Date.now();
  while (true) {
    try {
      return await check();
    } catch (err) {
      if (Date.now() - start >= timeoutMs) throw err;
    }
    await sleep(intervalMs);
  }
}
