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
  throw new Error("עוד לא כתבת את הפתרון");
}
