export function createMutex() {
  let tail: Promise<unknown> = Promise.resolve();
  let count = 0;
  return {
    run<T>(fn: () => Promise<T>): Promise<T> {
      count++;
      const result = tail.then(() => fn()).finally(() => count--);
      tail = result;
      return result;
    },
    pending: () => count,
  };
}
