// P12-E40: תור משימות אסינכרוני
export class TaskQueue {
  #tail: Promise<unknown> = Promise.resolve();
  #pending = 0;

  add<T>(task: () => Promise<T>): Promise<T> {
    this.#pending++;
    const run = this.#tail.then(() => task()).finally(() => {
      this.#pending--;
    });
    this.#tail = run.catch(() => {});
    return run;
  }

  get pending(): number {
    return this.#pending;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function demo() {
  const q = new TaskQueue();
  const log: string[] = [];
  const a = q.add(async () => { log.push("א התחיל"); await sleep(30); log.push("א הסתיים"); return "א"; });
  const bad = q.add(async () => { throw new Error("ב נכשל"); });
  const c = q.add(async () => { log.push("ג התחיל"); return "ג"; });
  console.log(q.pending);
  console.log(await a, await bad.catch((e: Error) => e.message), await c, q.pending);
  console.log(log);
}
demo();
