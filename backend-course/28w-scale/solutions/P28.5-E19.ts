// P28.5-E19: reservoir sampling — דגימה אחידה מזרם שלא יודעים את אורכו
export async function reservoirSample<T>(items: Iterable<T> | AsyncIterable<T>, k: number, random: () => number = Math.random): Promise<T[]> {
  if (!Number.isInteger(k) || k < 1) throw new Error("k חייב להיות שלם חיובי");
  const sample: T[] = [];
  let seen = 0;
  for await (const item of items) {
    seen++;
    if (sample.length < k) sample.push(item);
    else {
      const j = Math.floor(random() * seen); // 0..seen-1
      if (j < k) sample[j] = item; // הסיכוי של הפריט ה־n להיכנס: k/n
    }
  }
  return sample;
}
