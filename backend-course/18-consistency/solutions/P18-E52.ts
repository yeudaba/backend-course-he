// P18-E52: mutex בזיכרון
export function createMutex() {
  let tail: Promise<unknown> = Promise.resolve();
  let count = 0;
  return {
    run<T>(fn: () => Promise<T>): Promise<T> {
      count++;
      const result = tail.then(() => fn());
      tail = result.catch(() => {}).finally(() => count--);
      return result;
    },
    pending: () => count,
  };
}
