// P25-E28 — mapLimit: הרבה עבודות, מעט במקביל
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError("limit חייב להיות מספר שלם חיובי");
  const results: R[] = new Array(items.length);
  let next = 0;
  let failed = false;

  async function worker(): Promise<void> {
    while (next < items.length && !failed) {
      const index = next++;
      try {
        results[index] = await fn(items[index], index);
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function demo() {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let running = 0;
  let peak = 0;
  const started = Date.now();
  const sizes = await mapLimit(["a.js", "b.js", "c.css", "d.png", "e.svg"], 2, async (file, i) => {
    running++;
    peak = Math.max(peak, running);
    await sleep(100);
    running--;
    return `${i}:${file}`;
  });
  console.log(sizes);
  console.log("peak:", peak, "· ~ms:", Math.round((Date.now() - started) / 100) * 100);
  try {
    await mapLimit([1, 2, 3], 2, async (n) => {
      if (n === 2) throw new Error(`upload ${n} failed`);
      return n;
    });
  } catch (err) {
    console.log("נכשל:", (err as Error).message);
  }
}
demo();
