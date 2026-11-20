export function createMutex() {
  let count = 0;
  return {
    async run<T>(fn: () => Promise<T>): Promise<T> {
      count++;
      try {
        return await fn();
      } finally {
        count--;
      }
    },
    pending: () => count,
  };
}
