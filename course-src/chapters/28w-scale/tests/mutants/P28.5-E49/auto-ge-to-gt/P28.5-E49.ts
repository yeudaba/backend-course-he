// P28.5-E49: semaphore — לכל היותר N בבת אחת
export function createSemaphore(max: number, maxQueue = Infinity) {
  if (!Number.isInteger(max) || max <= 0) throw new RangeError("max חייב להיות שלם חיובי");
  let running = 0;
  const queue: (() => void)[] = [];

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    if (running >= max) {
      if (queue.length > maxQueue) throw new Error("busy: התור מלא");
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    running++;
    try {
      return await fn();
    } finally {
      running--;
      queue.shift()?.();
    }
  }

  return { run, active: () => running, waiting: () => queue.length };
}
