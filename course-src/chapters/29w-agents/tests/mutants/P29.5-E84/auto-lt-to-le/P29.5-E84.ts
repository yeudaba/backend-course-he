// P29.5-E84: עובדים במקביל, עם מגבלה ו־timeout
type Task = { worker: string; run: (signal: AbortSignal) => Promise<string> };
type Out = { worker: string; ok: boolean; text: string };

async function runOne(task: Task, timeoutMs: number): Promise<Out> {
  const ac = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<Out>((resolve) => {
    timer = setTimeout(() => {
      ac.abort();
      resolve({ worker: task.worker, ok: false, text: "timeout" });
    }, timeoutMs);
  });
  const work = task.run(ac.signal).then(
    (text): Out => ({ worker: task.worker, ok: true, text: text.slice(0, 2000) }),
    (err): Out => ({ worker: task.worker, ok: false, text: `error: ${(err as Error).message}` }),
  );
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function delegateAll(tasks: Task[], opts: { concurrency: number; timeoutMs: number }): Promise<Out[]> {
  const results: Out[] = new Array(tasks.length);
  let next = 0;
  const lane = async () => {
    while (next <= tasks.length) {
      const i = next++;
      results[i] = await runOne(tasks[i], opts.timeoutMs);
    }
  };
  await Promise.all(Array.from({ length: Math.min(opts.concurrency, tasks.length) }, lane));
  return results;
}
