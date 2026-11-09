// P28.5-E13: עבודת CPU ב־worker threads — כדי שה־event loop ימשיך לענות
import { Worker } from "node:worker_threads";

// הקוד שרץ בכל worker (מוכן): מקבל [from, to] ומחזיר כמה ראשוניים יש בטווח
export const WORKER_CODE = `
const { parentPort } = require("node:worker_threads");
parentPort.on("message", ([from, to]) => {
  let count = 0;
  for (let n = Math.max(2, from); n < to; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (prime) count++;
  }
  parentPort.postMessage(count);
});`;

export async function countPrimesParallel(limit: number, { threads = 4, chunks = 16 } = {}): Promise<number> {
  const size = Math.ceil(limit / chunks);
  const ranges: [number, number][] = Array.from({ length: chunks }, (_, i) => [i * size, Math.min(limit, (i + 1) * size)]);
  let next = 0;
  let total = 0;
  const workers = Array.from({ length: Math.min(threads, ranges.length) }, () => new Worker(WORKER_CODE, { eval: true }));
  try {
    // כל worker לוקח את הטווח הבא כשהוא מסיים — כך אף אחד לא יושב בטל
    await Promise.all(
      workers.map(
        (w) =>
          new Promise<void>((resolve, reject) => {
            const giveNext = () => {
              if (next >= ranges.length) return resolve();
              w.postMessage(ranges[next++]);
            };
            w.on("message", (count: number) => {
              total += count;
              giveNext();
            });
            w.on("error", reject);
            giveNext();
          }),
      ),
    );
  } finally {
    await Promise.all(workers.map((w) => w.terminate()));
  }
  return total;
}
